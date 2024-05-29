import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/slices/flashMessageSlice";
import {
  useRenderSearchScreenMutation,
  useGetMoreResultsMutation,
} from "../redux/api/searchApi";
import { castApiResponse } from "../types/types";

import "./SearchScreen.scss";

import type { video } from "../types/types";

const SearchScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [renderSearchScreen] = useRenderSearchScreenMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const q = searchParams.get("q");
      if (q && q !== "") {
        renderSearchScreen({ q })
          .then((data) => {
            const res = castApiResponse(data);
            if (res.data) {
              if (res.data.response === "success") {
                setVideos(res.data.data.videos);
              } else {
                dispatch(
                  addMessage({ type: "error", message: res.data.message })
                );
              }
            } else {
              dispatch(
                addMessage({ type: "error", message: "Error contacting API." })
              );
            }
            setIsLoading(false);
          })
          .catch((err) => {
            if (err instanceof Error) {
              dispatch(addMessage({ type: "error", message: err.message }));
            }
          });
      } else {
        setLoadError("Invalid search argument.");
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof Error)
        dispatch(addMessage({ type: "error", message: err.message }));

      setIsLoading(false);
    }
  }, []);

  const searchScreen = (
    <div className="search-results-container">
      {videos &&
        videos.map((v, index) => (
          <Link
            key={index}
            to={`/lib/${v.topic.replaceAll(" ", "-")}/${v.url.substring(20)}`}
          >
            <div
              className="video-result-image"
              style={{ backgroundImage: `url('${v.thumbnail}')` }}
            ></div>
            <div className="video-result-info">
              <div className="video-result-title">{v.title}</div>
              <div className="video-result-author">
                <div
                  className="video-result-author-avatar"
                  style={{ backgroundImage: `url('${v.pic_url}')` }}
                ></div>
                <div className="video-result-author-username">{v.username}</div>
              </div>
              <div className="video-result-description">{v.description}</div>
            </div>
          </Link>
        ))}
    </div>
  );

  return (
    <div className="search-page-container">
      <p className="search-result-text">
        Search results for '{searchParams.get("q")}'
      </p>
      {loadError && (
        <p className="search-result-text">Unexpected error: {loadError}</p>
      )}
      {isLoading ? <p>Loading...</p> : searchScreen}
    </div>
  );
};

export default SearchScreen;
