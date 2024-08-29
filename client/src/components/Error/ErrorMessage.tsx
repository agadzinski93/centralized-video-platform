import "./ErrorMessage.scss";

interface errorProps {
  status: number;
  msg: string;
}

const ErrorMessage = ({ status, msg }: errorProps) => {
  return (
    <p className="error-message">
      {status} {msg}
    </p>
  );
};

export default ErrorMessage;
