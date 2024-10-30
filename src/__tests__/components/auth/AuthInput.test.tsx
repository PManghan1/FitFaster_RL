import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AuthInput } from "../../../components/auth/AuthInput";

describe("AuthInput", () => {
  it("renders correctly with label", () => {
    const { getByText, getByPlaceholderText } = render(
      <AuthInput label="Email" placeholder="Enter your email" />
    );

    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
  });

  it("displays error message when provided", () => {
    const { getByText } = render(
      <AuthInput
        label="Email"
        placeholder="Enter your email"
        error="Invalid email address"
      />
    );

    expect(getByText("Invalid email address")).toBeTruthy();
  });

  it("handles text input correctly", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <AuthInput
        placeholder="Enter your email"
        onChangeText={onChangeText}
        value=""
      />
    );

    const input = getByPlaceholderText("Enter your email");
    fireEvent.changeText(input, "test@example.com");

    expect(onChangeText).toHaveBeenCalledWith("test@example.com");
  });

  it("applies disabled state correctly", () => {
    const { getByPlaceholderText } = render(
      <AuthInput
        placeholder="Enter your email"
        editable={false}
      />
    );

    const input = getByPlaceholderText("Enter your email");
    expect(input.props.editable).toBe(false);
  });

  it("applies custom styles correctly", () => {
    const customStyle = {
      backgroundColor: "#f0f0f0",
      borderRadius: 12,
    };

    const { getByPlaceholderText } = render(
      <AuthInput
        placeholder="Enter your email"
        style={customStyle}
      />
    );

    const input = getByPlaceholderText("Enter your email");
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: "#f0f0f0",
          borderRadius: 12,
        }),
      ])
    );
  });

  it("handles secure text entry correctly", () => {
    const { getByPlaceholderText } = render(
      <AuthInput
        placeholder="Enter password"
        secureTextEntry
      />
    );

    const input = getByPlaceholderText("Enter password");
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("handles keyboard type correctly", () => {
    const { getByPlaceholderText } = render(
      <AuthInput
        placeholder="Enter your email"
        keyboardType="email-address"
      />
    );

    const input = getByPlaceholderText("Enter your email");
    expect(input.props.keyboardType).toBe("email-address");
  });
});
