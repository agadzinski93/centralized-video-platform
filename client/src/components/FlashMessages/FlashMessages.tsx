import { useSelector } from "react-redux";
import FlashMessage from "./FlashMessage";

import "./FlashMessages.scss";

import type { IRootState } from "../../redux/store";

const FlashMessages = () => {
  const flashState = useSelector((state: IRootState) => state.flashMessages);

  return (
    <div className="flashMessages">
      {flashState.messages.map(({ id, type, message }) => (
        <FlashMessage key={id} id={id} type={type} message={message} />
      ))}
    </div>
  );
};

export default FlashMessages;
