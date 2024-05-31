import { useCallback, useState, useEffect } from "react";
import { useIntersectObserver } from "../hooks/useIntersectObserver";
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
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [searchParams] = useSearchParams();
  const [renderSearchScreen] = useRenderSearchScreenMutation();
  const [getMoreResults] = useGetMoreResultsMutation();
  const dispatch = useDispatch();

  /* START OF Intersection Observer-related Code */
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const getMoreResultsFn = useCallback(async () => {
    try {
      const q = searchParams.get("q");
      if (q && q !== "") {
        getMoreResults({ searchQuery: q, pageNumber: page })
          .then((data) => {
            const res = castApiResponse(data);
            if (res.data && res.data.response === "success") {
              if (res.data.data && res.data.data.length > 0) {
                setTarget(null);
                setPage(page + 1);
                setVideos((prev) => {
                  if (res.data && res.data.data) {
                    if (!prev) {
                      return res.data.data;
                    } else {
                      return prev.concat(res.data.data);
                    }
                  } else {
                    return null;
                  }
                });
              }
            } else {
              dispatch(
                addMessage({ type: "error", message: "Error contacting API." })
              );
            }
            setLoadingMore(false);
          })
          .catch((err) => {
            if (err instanceof Error) {
              dispatch(addMessage({ type: "error", message: err.message }));
            }
            setLoadingMore(false);
          });
      } else {
        setLoadError("Invalid search argument.");
        setLoadingMore(false);
      }
      setLoadingMore(false);
    } catch (err) {
      if (err instanceof Error)
        dispatch(addMessage({ type: "error", message: err.message }));

      setLoadingMore(false);
    }
  }, [dispatch, page, searchParams, getMoreResults]);
  const IntersectCb = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await getMoreResultsFn();
        }
      });
    },
    [getMoreResultsFn]
  );
  useIntersectObserver(target, IntersectCb);
  /* END OF Intersection Observer-related Code */

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
            setIsLoading(false);
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

  const addRefAttribute = (i: number) => {
    return i + 1 === page * 20 ? { ref: setTarget } : {};
  };

  const loadingMoreSpinner = <div className="loading-more-spinner"></div>;

  const searchScreen = (
    <div className="search-results-container">
      {videos &&
        videos.map((v, index) => (
          <Link
            key={index}
            {...addRefAttribute(index)}
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
      {loadingMore && loadingMoreSpinner}
    </div>
  );

  return (
    <div className="search-page-container">
      <h1 className="search-result-text">
        Search results for '{searchParams.get("q")}'
      </h1>
      {loadError && (
        <p className="search-result-text">Unexpected error: {loadError}</p>
      )}
      {isLoading ? <p>Loading...</p> : searchScreen}
    </div>
  );
};

export default SearchScreen;
