import React from "react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-red-500 text-sm mb-2" role="alert">{message}</p>
  );
};

export default ErrorMessage;
