import { http, HttpResponse } from 'msw';
import { homePageTopics, homePageVideos } from './data/homePageData';
import { searchPageData } from './data/searchPageData';
import { topicPageData } from './data/topicPageData';
import { videoPageData } from './data/videoPageData';
import { userPageData } from './data/user/userPage';
import { userPageTopics } from './data/user/userPageTopics';
import { userPageVideos } from './data/user/userPageVideos';
import { userPageAboutMe } from './data/user/userPageAboutMe';

const API_PATH = '/api/v1';

export const handlers = [
  http.get(`${API_PATH}/home`, () => {
    return HttpResponse.json({
      response: "success",
      status: 200,
      message: "Successfully retrieved home page data.",
      prevPath: "/",
      data: {
        title: "Programming Help | Your Source For Programming Tutorials",
        videos: homePageVideos,
        topics: homePageTopics
      }
    });
  }),
  http.get(`${API_PATH}/renderSearchScreen`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('q');

    return HttpResponse.json({
      response: 'success',
      status: 200,
      message: 'Successfully retrieved videos.',
      prevPath: '/',
      data: {
        searchQuery: `${search}`,
        videos: searchPageData
      }
    });
  }),
  http.get(`${API_PATH}/lib/:topic/renderTopicScreen`, () => {
    return HttpResponse.json({
      response: 'success',
      status: 200,
      message: 'Successfully retrived topic.',
      prevPath: '/',
      data: topicPageData
    });
  }),
  http.get(`${API_PATH}/lib/:topic/:video/renderVideoScreen`, () => {
    return HttpResponse.json({
      response: 'success',
      status: 200,
      message: 'Successfully retrived video.',
      prevPath: '/',
      data: videoPageData
    });
  }),
  http.get(`${API_PATH}/user/:username/renderUserScreen`, () => {
    return HttpResponse.json({
      response: 'success',
      status: 200,
      message: 'Successfully retrieved user data',
      prevPath: '/',
      data: userPageData
    });
  }),
  http.get(`${API_PATH}/user/:username/getUserContent`, ({ request }) => {
    let data: typeof userPageTopics | typeof userPageVideos | typeof userPageAboutMe;
    const url = new URL(request.url);
    const content = url.searchParams.get('content');

    switch (content) {
      case 'topics':
        data = userPageTopics;
        break;
      case 'videos':
        data = userPageVideos;
        break;
      case 'about-me':
        data = userPageAboutMe;
        break;
      default:
        data = userPageTopics;
    }

    return HttpResponse.json({
      response: 'success',
      status: 200,
      message: 'Successfully retrieved more content.',
      prevPath: '/',
      data: {
        response: 'success',
        data,
        moreResults: false
      }
    });
  })
];