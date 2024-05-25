import { useDispatch } from "react-redux";
import { addMessage } from "../redux/slices/flashMessageSlice";

import "./HealthScreen.scss";

const HealthScreen = () => {
  const dispatch = useDispatch();

  const handleTestFlashMessages = () => {
    dispatch(
      addMessage({
        type: "success",
        message: "This is a test of a successful message. Congrats!",
      })
    );
    dispatch(
      addMessage({
        type: "error",
        message:
          "This is a sample error flash message. This appears when something goes wrong.",
      })
    );
  };

  return (
    <div className="health-page-container">
      <div className="test-options-container">
        <button id="main" onClick={handleTestFlashMessages}>
          Test Flash Messages
        </button>
      </div>
    </div>
  );
};

export default HealthScreen;
