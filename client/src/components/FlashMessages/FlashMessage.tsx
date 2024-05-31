import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeMessage } from "../../redux/slices/flashMessageSlice";

import "./FlashMessage.scss";

import type { FlashMessageType } from "../../types/types";

const FlashMessage = ({ id, type = "error", message }: FlashMessageType) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const foo = setTimeout(() => {
      dispatch(removeMessage({ id }));
    }, 8000);

    () => {
      clearInterval(foo);
    };
  }, [id, dispatch]);
  return (
    <div className={`message-${type}`}>
      <div className="message-symbol">
        {type === "success" ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,256,256">
            <g
              fill="#ffffff"
              fillRule="nonzero"
              stroke="none"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              strokeDasharray=""
              strokeDashoffset="0"
              fontFamily="none"
              fontWeight="normal"
              fontSize="none"
              textAnchor="start"
              style={{ mixBlendMode: "normal" }}
            >
              <g transform="scale(10.66667,10.66667)">
                <path d="M12,2c-5.514,0 -10,4.486 -10,10c0,5.514 4.486,10 10,10c5.514,0 10,-4.486 10,-10c0,-1.126 -0.19602,-2.2058 -0.54102,-3.2168l-1.61914,1.61914c0.105,0.516 0.16016,1.05066 0.16016,1.59766c0,4.411 -3.589,8 -8,8c-4.411,0 -8,-3.589 -8,-8c0,-4.411 3.589,-8 8,-8c1.633,0 3.15192,0.49389 4.41992,1.33789l1.43164,-1.43164c-1.648,-1.194 -3.66656,-1.90625 -5.85156,-1.90625zM21.29297,3.29297l-10.29297,10.29297l-3.29297,-3.29297l-1.41406,1.41406l4.70703,4.70703l11.70703,-11.70703z"></path>
              </g>
            </g>
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#FFFFFF"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M2.20164 18.4695L10.1643 4.00506C10.9021 2.66498 13.0979 2.66498 13.8357 4.00506L21.7984 18.4695C22.4443 19.6428 21.4598 21 19.9627 21H4.0373C2.54022 21 1.55571 19.6428 2.20164 18.4695Z"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
              <path
                d="M12 9V13"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
              <path
                d="M12 17.0195V17"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
            </g>
          </svg>
        )}
      </div>
      <p className="message-text">{message}</p>
    </div>
  );
};

export default FlashMessage;
