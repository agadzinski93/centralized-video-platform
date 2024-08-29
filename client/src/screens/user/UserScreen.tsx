import { useState, useEffect, useReducer } from "react";
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
import ErrorMessage from "../../components/Error/ErrorMessage";

import "./UserScreen.scss";

import type { author, topic, video, aboutMe } from "../../types/types";

interface searchOptions {
  username?: string;
  content?: "topics" | "videos" | "about-me" | undefined;
  viewAll?: boolean;
  page?: number | undefined;
  gettingMoreResults?: boolean;
}

interface AuthorContentType {
  viewContent: "topics" | "videos" | "about-me";
  moreResults: boolean;
  viewAll: boolean;
  pageNum: number;
  data: topic[] | video[] | aboutMe | null;
}

interface Action {
  type: "topics" | "videos" | "about-me";
  payload: {
    moreResults?: boolean;
    viewAll?: boolean;
    pageNum?: number;
    data: topic[] | video[] | aboutMe;
  };
}

const UserScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(true);
  const [fetchingMoreResults, setFetchingMoreResults] =
    useState<boolean>(false);
  const [author, setAuthor] = useState<author | null>(null);

  const reducer = (
    state: AuthorContentType,
    action: Action
  ): AuthorContentType => {
    switch (action.type) {
      case "topics":
        return {
          ...state,
          viewContent: "topics",
          data: action.payload.pageNum
            ? (state.data as topic[]).concat(action.payload.data as topic[])
            : action.payload.data,
          moreResults:
            typeof action.payload.moreResults === "boolean"
              ? action.payload.moreResults
              : state.moreResults,
          viewAll:
            typeof action.payload.viewAll === "boolean"
              ? action.payload.viewAll
              : state.viewAll,
          pageNum:
            typeof action.payload.pageNum === "number"
              ? action.payload.pageNum + 1
              : 0,
        };
      case "videos":
        return {
          ...state,
          viewContent: "videos",
          data: action.payload.pageNum
            ? (state.data as video[]).concat(action.payload.data as video[])
            : action.payload.data,
          moreResults:
            typeof action.payload.moreResults === "boolean"
              ? action.payload.moreResults
              : state.moreResults,
          viewAll:
            typeof action.payload.viewAll === "boolean"
              ? action.payload.viewAll
              : state.viewAll,
          pageNum:
            typeof action.payload.pageNum === "number"
              ? action.payload.pageNum + 1
              : 0,
        };
      case "about-me":
        return { ...state, viewContent: "about-me", data: action.payload.data };
      default:
    }
    return { ...state };
  };

  const [
    { viewContent, viewAll, moreResults, pageNum, data },
    dispatchContent,
  ] = useReducer(reducer, {
    viewContent: "topics",
    moreResults: false,
    viewAll: false,
    pageNum: 0,
    data: null,
  });

  const { username: userParam } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [renderUserScreen] = useRenderUserScreenMutation();
  const [getUserContent] = useGetUserContentMutation();

  const handleClickTopics = async () => {
    if (author && viewContent !== "topics") {
      const output = await getContent({ username: author.username });
      if (output)
        dispatchContent({
          type: "topics",
          payload: {
            data: output.data,
            moreResults: false,
            viewAll: false,
          },
        });
    }
  };

  const handleClickVideos = async () => {
    if (author && viewContent !== "videos") {
      const output = await getContent({
        username: author.username,
        content: "videos",
      });
      if (output)
        dispatchContent({
          type: "videos",
          payload: {
            data: output.data,
            moreResults: false,
            viewAll: false,
          },
        });
    }
  };

  const handleAbout = async () => {
    if (author && viewContent !== "about-me") {
      const output = await getContent({
        username: author.username,
        content: "about-me",
      });
      if (output)
        dispatchContent({
          type: "about-me",
          payload: {
            data: output.data,
            moreResults: false,
            viewAll: false,
          },
        });
    }
  };

  const handleViewAll = async () => {
    if (author) {
      const output = await getContent({
        username: author.username,
        content: viewContent,
        viewAll: true,
      });
      if (output)
        dispatchContent({
          type: viewContent,
          payload: {
            data: output.data,
            viewAll: true,
            moreResults: output.moreResults,
            pageNum: 0,
          },
        });
    }
  };

  const handleMoreResults = async () => {
    if (author) {
      const output = await getContent({
        username: author.username,
        content: viewContent,
        viewAll: true,
        page: pageNum + 1,
        gettingMoreResults: true,
      });
      if (output) {
        dispatchContent({
          type: viewContent,
          payload: {
            data: output.data,
            viewAll: true,
            moreResults: output.moreResults,
            pageNum: pageNum,
          },
        });
      }
    }
  };

  const getContent = async ({
    username,
    content,
    viewAll,
    page,
    gettingMoreResults = false,
  }: searchOptions) => {
    try {
      if (gettingMoreResults) {
        setFetchingMoreResults(true);
      } else {
        setFetchLoading(true);
      }
      if (author || username) {
        const result = await getUserContent({
          username: username ? username : (author as author).username,
          content,
          viewAll,
          page,
        });
        const res = castApiResponse(result);
        if (res.data) {
          setFetchLoading(false);
          setFetchingMoreResults(false);
          return {
            moreResults: res.data.data.moreResults,
            data: res.data.data.data,
          };
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
      setFetchingMoreResults(false);
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
      setUserExists(true);
      if (userParam) {
        renderUserScreen({ username: userParam })
          .then((data) => {
            const res = castApiResponse(data);
            if (res.data) {
              setAuthor(res.data.data.author);
              document.title = `${res.data.data.author.username}'s Page | Centralized Video Platform`;
              getContent({ username: res.data.data.author.username })
                .then((output) => {
                  if (output)
                    dispatchContent({
                      type: "topics",
                      payload: { data: output.data, viewAll: false },
                    });
                  setIsLoading(false);
                })
                .catch((err) => {
                  throw err;
                });
            } else {
              if (res?.error?.data?.status === 404) {
                setUserExists(false);
              } else {
                dispatch(
                  addMessage({
                    type: "error",
                    message: res.error?.data?.message
                      ? res.error.data.message
                      : "Something went wrong",
                  })
                );
                navigate("/");
              }
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

  const btnMoreResults = fetchingMoreResults ? (
    spinner
  ) : (
    <div className="view-more-container">
      <button onClick={handleMoreResults}>More</button>
    </div>
  );

  const btnViewAll = (
    <div className="view-all-container">
      <button onClick={handleViewAll} className="view-all">
        View All
      </button>
    </div>
  );

  const topicResults = fetchLoading
    ? spinner
    : viewContent === "topics" &&
      data && (
        <>
          {(data as topic[]).length === 12 && !viewAll && btnViewAll}
          <div className="author-topics-container">
            {(data as topic[]).map((topic) => (
              <TopicTile key={topic.name} className={"topic"} topic={topic} />
            ))}
          </div>
        </>
      );
  const videoResults = fetchLoading
    ? spinner
    : viewContent === "videos" &&
      data && (
        <>
          {(data as video[]).length === 12 && !viewAll && btnViewAll}
          <div className="author-videos-container">
            {(data as video[]).map((video, index) => (
              <VideoTile
                key={index}
                className={"video"}
                includeAuthor={false}
                video={video}
              />
            ))}
          </div>
          {moreResults && btnMoreResults}
        </>
      );
  const aboutResults = fetchLoading
    ? spinner
    : data && (
        <div className="author-about-me">
          <div>Joined</div>
          <div>
            {new Date(Date.parse((data as aboutMe).dateJoined)).toDateString()}
          </div>
          <div>Subscriptions</div>
          <div>{(data as aboutMe).subscriptions}</div>
          <div>About Me</div>
          <div>{(data as aboutMe).about_me}</div>
        </div>
      );

  const userScreen = author && (
    <>
      <div
        className="author-banner"
        style={{
          backgroundImage:
            author.banner_url.substring(0, 4) === "http"
              ? `url('${author.banner_url}')`
              : `url('/api/v1${author.banner_url}')`,
        }}
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
      {isLoading ? (
        <div>Loading...</div>
      ) : userExists ? (
        userScreen
      ) : (
        <ErrorMessage status={404} msg={"User not found"} />
      )}
    </div>
  );
};

export default UserScreen;
