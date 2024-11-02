import { PostgrestError } from '@supabase/supabase-js';

import {
  ConsentPurpose,
  ConsentRecord,
  DataAccessType,
  DecryptedHealthData,
  EncryptedHealthData,
  EssentialProfile,
  PrivacySettings,
} from '../types/profile';
import {
  assertType,
  DatabaseError,
  decryptHealthData,
  encryptHealthData,
  handleError,
  isConsentRecord,
  isHealthData,
  isPrivacySettings,
  isProfile,
} from '../utils/database';

import { supabase } from './supabase';

interface DatabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

class ProfileService {
  private async logAccess(
    userId: string,
    accessType: DataAccessType,
    dataCategory: 'ESSENTIAL' | 'HEALTH' | 'CONSENT',
    purpose: string,
    success: boolean,
    details?: string,
  ): Promise<void> {
    try {
      const result = await supabase.from('processing_logs').insert({
        user_id: userId,
        timestamp: new Date().toISOString(),
        access_type: accessType,
        data_category: dataCategory,
        purpose,
        processor: 'APP',
        success,
        details,
        ip_address: 'CLIENT_APP',
      });

      if (result.error) throw result.error;
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  }

  async getProfile(userId: string): Promise<EssentialProfile | null> {
    try {
      const result = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (result.error) throw result.error;
      if (!result.data) return null;

      assertType<EssentialProfile>(result.data, isProfile, 'Invalid profile data');
      await this.logAccess(userId, 'READ', 'ESSENTIAL', 'GET_PROFILE', true);
      return result.data;
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(userId, 'READ', 'ESSENTIAL', 'GET_PROFILE', false, dbError.message);
      throw dbError;
    }
  }

  async getHealthData(userId: string): Promise<DecryptedHealthData | null> {
    try {
      const result = await supabase.from('health_data').select('*').eq('user_id', userId).single();

      if (result.error) throw result.error;
      if (!result.data) return null;

      assertType<EncryptedHealthData>(result.data, isHealthData, 'Invalid health data');
      const decryptedData = decryptHealthData(result.data);
      await this.logAccess(userId, 'READ', 'HEALTH', 'GET_HEALTH_DATA', true);
      return decryptedData;
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(userId, 'READ', 'HEALTH', 'GET_HEALTH_DATA', false, dbError.message);
      throw dbError;
    }
  }

  async updateHealthData(userId: string, data: Partial<DecryptedHealthData>): Promise<void> {
    try {
      const encryptedData = encryptHealthData(data);

      const result = await supabase.from('health_data').upsert({
        user_id: userId,
        ...encryptedData,
        encrypted: true,
        updated_at: new Date().toISOString(),
      });

      if (result.error) throw result.error;

      await this.logAccess(userId, 'WRITE', 'HEALTH', 'UPDATE_HEALTH_DATA', true);
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(userId, 'WRITE', 'HEALTH', 'UPDATE_HEALTH_DATA', false, dbError.message);
      throw dbError;
    }
  }

  async recordConsent(
    userId: string,
    purpose: ConsentPurpose,
    granted: boolean,
    userAgent: string,
  ): Promise<void> {
    try {
      const result = await supabase.from('consent_records').insert({
        user_id: userId,
        purpose,
        granted,
        timestamp: new Date().toISOString(),
        ip_address: 'CLIENT_APP',
        user_agent: userAgent,
        version: '1.0',
      });

      if (result.error) throw result.error;

      await this.logAccess(userId, 'WRITE', 'CONSENT', 'RECORD_CONSENT', true);
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(userId, 'WRITE', 'CONSENT', 'RECORD_CONSENT', false, dbError.message);
      throw dbError;
    }
  }

  async getConsentStatus(userId: string, purpose: ConsentPurpose): Promise<boolean> {
    try {
      const result = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('purpose', purpose)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (result.error && result.error.code !== 'PGRST116') {
        throw result.error;
      }

      if (result.data) {
        assertType<ConsentRecord>(result.data, isConsentRecord, 'Invalid consent record');
        await this.logAccess(userId, 'READ', 'CONSENT', 'GET_CONSENT_STATUS', true);
        return result.data.granted;
      }

      return false;
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(userId, 'READ', 'CONSENT', 'GET_CONSENT_STATUS', false, dbError.message);
      throw dbError;
    }
  }

  async exportUserData(userId: string): Promise<{
    profile: EssentialProfile;
    healthData: DecryptedHealthData | null;
    consents: ConsentRecord[];
    privacySettings: PrivacySettings;
  }> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) throw new DatabaseError('Profile not found');

      const healthData = await this.getHealthData(userId);

      const [consentsResult, privacySettingsResult] = (await Promise.all([
        supabase.from('consent_records').select('*').eq('user_id', userId),
        supabase.from('privacy_settings').select('*').eq('user_id', userId).single(),
      ])) as [DatabaseResult<ConsentRecord[]>, DatabaseResult<PrivacySettings>];

      if (consentsResult.error) throw consentsResult.error;
      if (privacySettingsResult.error) throw privacySettingsResult.error;
      if (!consentsResult.data || !privacySettingsResult.data) {
        throw new DatabaseError('Failed to fetch user data');
      }

      const consents = consentsResult.data.map(record => {
        assertType<ConsentRecord>(record, isConsentRecord, 'Invalid consent record');
        return record;
      });

      assertType<PrivacySettings>(
        privacySettingsResult.data,
        isPrivacySettings,
        'Invalid privacy settings',
      );

      await this.logAccess(userId, 'EXPORT', 'ESSENTIAL', 'EXPORT_USER_DATA', true);

      return {
        profile,
        healthData,
        consents,
        privacySettings: privacySettingsResult.data,
      };
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(
        userId,
        'EXPORT',
        'ESSENTIAL',
        'EXPORT_USER_DATA',
        false,
        dbError.message,
      );
      throw dbError;
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      const promises = [
        supabase.from('processing_logs').delete().eq('user_id', userId),
        supabase.from('consent_records').delete().eq('user_id', userId),
        supabase.from('privacy_settings').delete().eq('user_id', userId),
        supabase.from('health_data').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('id', userId),
      ];

      const results = await Promise.all(promises);
      const errors = results
        .map(result => result.error)
        .filter((error): error is PostgrestError => error !== null);

      if (errors.length > 0) {
        throw new DatabaseError(
          `Failed to delete all user data: ${errors.map(e => e.message).join(', ')}`,
        );
      }

      await this.logAccess(userId, 'DELETE', 'ESSENTIAL', 'DELETE_USER_DATA', true);
    } catch (error) {
      const dbError = handleError(error);
      await this.logAccess(
        userId,
        'DELETE',
        'ESSENTIAL',
        'DELETE_USER_DATA',
        false,
        dbError.message,
      );
      throw dbError;
    }
  }
}

export const profileService = new ProfileService();
