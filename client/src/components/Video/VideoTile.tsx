import { Link } from "react-router-dom";
import { getUploadedWhen } from "../../assets/scripts/scripts";

import type { video } from "../../types/types";

import "./VideoTile.scss";

interface videoTileProps {
  video: video;
  id?: string;
  className?: string;
  includeAuthor?: boolean;
}

const createMainId = (id: string) => {
  return id !== "" ? { id } : {};
};

const VideoTile = ({
  video,
  id = "",
  className,
  includeAuthor = true,
}: videoTileProps) => {
  return (
    <div className={className}>
      <Link
        {...createMainId(id)}
        className="video-link"
        to={`/lib/${video.topicUrl}/${video.url.substring(20)}`}
      >
        <div
          className="video-thumbnail"
          style={{
            backgroundImage: `url('${video.thumbnail}')`,
          }}
        ></div>
        <p>{video.title}</p>
      </Link>
      {includeAuthor && (
        <Link className="author-link" to={`/user/${video.username}`}>
          <div className="video-info">
            <div className="upload-info">
              <div
                className="avatar"
                style={{ backgroundImage: `url('${video.pic_url}')` }}
              ></div>
              <div>
                <div className="username">{video.username}</div>
                <div className={"uploaded-when"}>
                  {getUploadedWhen.call(null, video.timeCreated)}
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default VideoTile;
