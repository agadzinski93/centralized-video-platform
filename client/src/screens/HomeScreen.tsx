import { useState, useEffect, useCallback, SyntheticEvent } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/slices/flashMessageSlice";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import LoadingHomeScreen from "./loaders/LoadingHomeScreen";
import VideoTile from "../components/Video/VideoTile";

import "./HomeScreen.scss";

import type { ApiResponse } from "../types/types";
import type { topic, video } from "../types/types";

interface HomeApiResponse extends ApiResponse {
  data?: {
    title: string;
    topics: topic[];
    videos: video[];
  };
}

const API_TARGET: string = `/api/v1/home`;
const SLIDER_INTERVAL: number = 5000;

const HomeScreen = () => {
  const { isLoading, data, error } = useFetch<HomeApiResponse>(API_TARGET, {
    method: "GET",
  });
  const [topics, setTopics] = useState<topic[] | null>(null);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [active, setActive] = useState<number>(0);
  const dispatch = useDispatch();

  const setSlider = (e: SyntheticEvent) => {
    setActive(parseInt((e.target as HTMLButtonElement).value));
  };

  const keypressEventsForSlider = useCallback(
    (e: KeyboardEvent) => {
      if (document.getElementById("search-form") !== document.activeElement) {
        let num = parseInt(e.key);
        const isNum = Number.isInteger(num);
        if (topics && isNum && num - 1 < topics.length) {
          num--;
          setActive(num);
          setTimeout(() => {
            document.getElementById(num.toString())?.focus();
          }, 200);
        }
      }
    },
    [topics]
  );

  useEffect(() => {
    document.title = "Home | Centralized Video Platform";
  }, []);

  useEffect(() => {
    if (error) dispatch(addMessage({ type: "error", message: error.message }));
  }, [error]);

  useEffect(() => {
    let timer = null;
    if (topics && topics.length > 1) {
      timer = setInterval(() => {
        setActive((prevActive) => {
          if (prevActive === topics.length - 1) {
            return 0;
          } else {
            return active + 1;
          }
        });
      }, SLIDER_INTERVAL);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [topics, active]);

  useEffect(() => {
    if (data?.data?.topics) {
      setTopics(data.data.topics);
      if (topics) {
        document.addEventListener("keyup", keypressEventsForSlider);
      }
    }
    if (data?.data?.videos) {
      setVideos(data.data.videos);
    }

    return () => {
      document.removeEventListener("keyup", keypressEventsForSlider);
    };
  }, [data, videos, topics, keypressEventsForSlider]);

  const topicSlider = (
    <div className="topic-slider-container">
      <div
        className="topic-slider"
        style={{
          transform: `translate(${active * -100}%)`,
        }}
      >
        {topics &&
          topics.length > 0 &&
          topics.map((topic, index) => (
            <div key={index} className="slider-item">
              <div className="topic-info">
                <h2 className="topic-title">{topic.name}</h2>
                <div className="topic-difficulty-key-container">
                  <p className="topic-difficulty">{topic.difficulty}</p>
                  <p className="topic-dot-separator">&#x2022;</p>
                  <div
                    className="topic-slider-key"
                    style={{
                      backgroundImage: `url('/images/key-${index + 1}.png')`,
                    }}
                  ></div>
                </div>
                <p className="topic-description">{topic.description}</p>
                <div className="topic-link-container">
                  <Link
                    tabIndex={-1}
                    to={`/lib/${topic.topicUrl}`}
                    id={`${index.toString()}`}
                  >
                    Watch Now &rarr;
                  </Link>
                </div>
              </div>
              <div className="topic-image-container">
                <div
                  className="topic-image"
                  style={
                    topic.imageUrl.substring(0, 4) === "http"
                      ? { backgroundImage: `url('${topic.imageUrl}')` }
                      : { backgroundImage: `url('/api/v1${topic.imageUrl}')` }
                  }
                ></div>
              </div>
            </div>
          ))}
      </div>
      {topics && topics.length > 0 && (
        <div className="topic-buttons">
          {topics.map((_, index) => (
            <button
              key={index}
              tabIndex={-1}
              className={`topic-button ${active === index && "active"}`}
              value={index}
              onClick={setSlider}
            >
              &#x2022;
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const recentVideos = (
    <div className="recent-videos">
      {videos &&
        videos.length > 0 &&
        videos.map((video, index) =>
          index === 0 ? (
            <VideoTile
              key={index}
              id={"main"}
              className="video"
              video={video}
            />
          ) : (
            <VideoTile key={index} className="video" video={video} />
          )
        )}
    </div>
  );

  const dataOutput = (
    <div className="home-page-con">
      <h1>Centralized Video Platform</h1>
      {isLoading ? (
        <LoadingHomeScreen />
      ) : (
        data && (
          <>
            {topicSlider}
            <h2>Recent Videos</h2>
            {recentVideos}
          </>
        )
      )}
    </div>
  );

  return (
    <>{error ? <div className="home-page-error">Error</div> : dataOutput}</>
  );
};

export default HomeScreen;
