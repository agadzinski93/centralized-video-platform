import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addMessage } from "../../redux/slices/flashMessageSlice";
import {
  useRenderUserScreenMutation,
  useGetUserContentMutation,
} from "../../redux/api/userApi";
import { castApiResponse } from "../../types/types";
import TopicTile from "../../components/Topic/TopicTile";
import VideoTile from "../../components/Video/VideoTile";

import "./UserScreen.scss";

import type { author, topic, video, aboutMe } from "../../types/types";

interface searchOptions {
  username?: string;
  content?: "topics" | "videos" | "about-me" | undefined;
  viewAll?: boolean | undefined;
  page?: number | undefined;
}

const UserScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [author, setAuthor] = useState<author | null>(null);
  const [viewContent, setViewContent] = useState<
    "topics" | "videos" | "about-me"
  >("topics");
  const [topics, setTopics] = useState<topic[] | null>(null);
  const [videos, setVideos] = useState<video[] | null>(null);
  const [about, setAbout] = useState<aboutMe | null>(null);
  const { username: userParam } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [renderUserScreen] = useRenderUserScreenMutation();
  const [getUserContent] = useGetUserContentMutation();

  const handleClickTopics = () => {
    if (viewContent !== "topics") {
      setViewContent("topics");
      setTopics(null);
      getContent({ content: "topics" });
    }
  };

  const handleClickVideos = () => {
    if (viewContent !== "videos") {
      setViewContent("videos");
      setVideos(null);
      getContent({ content: "videos" });
    }
  };

  const handleAbout = () => {
    if (viewContent !== "about-me") {
      setViewContent("about-me");
      setAbout(null);
      getContent({ content: "about-me" });
    }
  };

  const getContent = async ({
    username,
    content,
    viewAll,
    page,
  }: searchOptions) => {
    try {
      setFetchLoading(true);
      if (author || username) {
        const result = await getUserContent({
          username: username ? username : (author as author).username,
          content,
          viewAll,
          page,
        });
        const res = castApiResponse(result);
        if (res.data) {
          switch (content) {
            case undefined:
            case "topics":
              setTopics(res.data.data.data as topic[]);
              setViewContent("topics");
              break;
            case "videos":
              setVideos(res.data.data.data as video[]);
              setViewContent(content);
              break;
            case "about-me":
              setAbout(res.data.data.data as aboutMe);
              setViewContent(content);
              break;
            default:
              throw new Error("Invalid fetch arguments");
          }
        } else {
          throw new Error("Error fetching data");
        }
      } else {
        addMessage({
          type: "error",
          message: "Something went wrong",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        dispatch(addMessage({ type: "error", message: err.message }));
        console.error(err.message);
      }
    }
    setFetchLoading(false);
    setIsLoading(false);
  };

  useEffect(() => {
    try {
      if (userParam) {
        renderUserScreen({ username: userParam })
          .then((data) => {
            const res = castApiResponse(data);
            if (res.data) {
              setAuthor(res.data.data.author);
              document.title = `${res.data.data.author.username}'s Page | Centralized Video Platform`;
              getContent({ username: res.data.data.author.username });
              setIsLoading(false);
            } else {
              dispatch(
                addMessage({
                  type: "error",
                  message: res.error?.error
                    ? res.error.error
                    : "Something went wrong",
                })
              );
              setIsLoading(false);
            }
          })
          .catch((err) => {
            if (err instanceof Error) {
              dispatch(addMessage({ type: "error", message: err.message }));
              console.error(err.message);
            }
            setIsLoading(false);
          });
      } else {
        dispatch(addMessage({ type: "error", message: "No user given" }));
        setIsLoading(false);
        navigate("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        dispatch(addMessage({ type: "error", message: err.message }));
        console.error(err.message);
      }
      setIsLoading(false);
      navigate("/");
    }
  }, []);

  const spinner = <div className="user-page-spinner"></div>;

  const topicResults = fetchLoading ? (
    spinner
  ) : (
    <div className="author-topics-container">
      {topics &&
        topics.map((topic) => <TopicTile className={"topic"} topic={topic} />)}
    </div>
  );
  const videoResults = fetchLoading ? (
    spinner
  ) : (
    <div className="author-videos-container">
      {videos &&
        videos.map((video) => (
          <VideoTile className={"video"} includeAuthor={false} video={video} />
        ))}
    </div>
  );
  const aboutResults = fetchLoading ? spinner : <p>{about?.about_me}</p>;

  const userScreen = author && (
    <>
      <div
        className="author-banner"
        style={{ backgroundImage: `url('${author.banner_url}')` }}
      ></div>
      <section className="author">
        <div
          className="author-avatar"
          style={{ backgroundImage: `url('${author.pic_url}')` }}
        ></div>
        <div className="author-info">
          <h1>{author.username}</h1>
          <p className="author-subscribers">{author.subscribers} subscribers</p>
        </div>
      </section>
      <div className="content-selector-container">
        <button
          onClick={handleClickTopics}
          className={viewContent === "topics" ? "active" : ""}
        >
          Topics
        </button>
        <button
          onClick={handleClickVideos}
          className={viewContent === "videos" ? "active" : ""}
        >
          Videos
        </button>
        <button
          onClick={handleAbout}
          className={viewContent === "about-me" ? "active" : ""}
        >
          About
        </button>
      </div>
      {viewContent === "topics" && topicResults}
      {viewContent === "videos" && videoResults}
      {viewContent === "about-me" && aboutResults}
    </>
  );

  return (
    <div className="user-page-container">
      {isLoading ? <div>Loading...</div> : userScreen}
    </div>
  );
};

export default UserScreen;
