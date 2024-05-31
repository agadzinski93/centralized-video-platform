import { Link } from "react-router-dom";

import "./TopicTile.scss";

import type { topic } from "../../types/types";

interface topicTileProps {
  topic: topic;
  id?: string;
  className?: string;
}

const createMainId = (id: string) => {
  return id !== "" ? { id } : {};
};

const TopicTile = ({ topic, id = "", className }: topicTileProps) => {
  return (
    <div className={className}>
      <Link
        {...createMainId(id)}
        className="topic-link"
        to={`/lib/${topic.name.replaceAll(" ", "-")}`}
      >
        <div
          className="topic-thumbnail"
          style={{
            backgroundImage: `url('${topic.imageUrl}')`,
          }}
        ></div>
        <p>{topic.name}</p>
      </Link>
    </div>
  );
};

export default TopicTile;
