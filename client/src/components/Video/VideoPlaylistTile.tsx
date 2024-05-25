import { Link } from "react-router-dom";
import { getUploadedWhen } from "../../assets/scripts/scripts";

import "./VideoPlaylistTile.scss";

import type { video } from "../../types/types";

interface videoTileProps {
  video: video;
  id?: string;
  className?: string;
}

const VideoPlaylistTile = ({ video }: videoTileProps) => {
  return (
    <div className="topic-playlist-video-tile">
      <Link
        className="video-link"
        to={`/lib/${video.topicUrl}/${video.url.substring(20)}`}
      >
        <div
          className="video-thumbnail"
          style={{
            backgroundImage: `url('${video.thumbnail}')`,
          }}
        ></div>
        <div className="video-tile-info">
          <p className="video-tile-title">{video.title}</p>
          <p className="username">{video.username}</p>
          <p className="uploaded-when">
            {getUploadedWhen.call(null, video.timeCreated)}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default VideoPlaylistTile;
