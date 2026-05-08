import type { ApiPost } from "api/types";
import { View } from "components/styledComponents";
import React from "react";

import PostList from "./PostList";

const testPosts: ApiPost[] = [
  {
    id: 1,
    title: "New Feature Release",
    body: "We are excited to announce the release of our new feature...",
    published_at: "2024-06-01T00:00:00Z",
    parent: {
      id: 1,
      title: "Project Alpha",
      icon_url: "https://example.com/project-icon.png",
      type: "collection",
    },
    user: {
      login: "johndoe",
      icon_url: "https://example.com/hero-image.jpg",
    },
  },
];

const News = ( ) => (
  <View className="flex-1">
    <PostList posts={testPosts} />
  </View>
);

export default News;
