import {
  users as sampleUsers,
  articles as samplePosts,
  entries as sampleTopics,
} from "./data_sample.js";

import {
  getUser, saveUser,
  getPost, savePost,
  getCategories, saveCategories,
} from "./storage.js";

export function initData() {
  // USER ( Check by Email) 
  let localUsers = getUser();
  sampleUsers.forEach((sample) => {
    const isExist = localUsers.find(u => u.email === sample.email);
    if (!isExist) {
      localUsers.push(sample);
    }
  });
  saveUser(localUsers);

  // POSTS (Check by ID or Title)
  let localPost = getPost();
  samplePosts.forEach((sample) => {
    const isExist = localPost.find(p => p.id === sample.id || p.title === sample.title);
    if (!isExist) {
      localPost.push(sample);
    }
  });
  savePost(localPost);

  // TOPICS (Check by Name)
  let localTopics = getCategories();
  sampleTopics.forEach((sample) => {
    const isExist = localTopics.find(t => t.categoryName === sample.categoryName);
    if (!isExist) {
      localTopics.push(sample);
    }
  });
  saveCategories(localTopics);
}

// INIT
initData();