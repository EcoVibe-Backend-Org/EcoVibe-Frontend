import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
// Define types
interface Attachment {
  filename: string;
  data: string;
  mimetype: string;
}

interface User {
  _id: string;
  username: string;
}

interface Comment {
  _id: string;
  content: string;
  user: User;
  createdAt: string;
  replies: Comment[];
}

interface Post {
  _id: string;
  title: string;
  content: string;
  user: User;
  attachments: Attachment[];
  createdAt: string;
}

// API URL - replace with your actual API URL
const API_URL = 'https://ecovibe-backend.up.railway.app/api';

const PostsScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [removingAttachments, setRemovingAttachments] = useState<string[]>([]);
  
  const navigation = useNavigation<any>();
  
  // Fetch token and user ID from AsyncStorage
  useEffect(() => {
    const getAuthData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setToken(parsedUserData.token);
          setUserId(parsedUserData.id);
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
      }
    };
  
    getAuthData();
  }, []);

  // Fetch posts when component mounts or when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const TABS = ['All', 'Friends', 'Trending', 'Events'];


const CommunityFeedBanner = () => (
  <View
    className="px-4 pt-4 pb-3 bg-white flex-row items-center justify-between"
    style={{ width: '100%' }}
  >
    <Text className="text-lg font-semibold text-black">Community Feed</Text>
    <View className="flex-row items-center">
  <TouchableOpacity style={{ marginRight: 12 }}>
    <Ionicons name="search" size={20} color="black" />
  </TouchableOpacity>
  <TouchableOpacity>
    <Ionicons name="options-outline" size={20} color="black" />
  </TouchableOpacity>
</View>

  </View>
);

const FeedTabs = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <View
      className="bg-white px-4 pt-2 pb-4"
      style={{ width: '100%' }}
    >
      <View className="flex-row flex-wrap gap-2">
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full ${
                isActive ? 'bg-green-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-black'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        multiple: true,
      });
  
      if (result.canceled) return;
  
      const newAttachments = await Promise.all(
        result.assets.map(async (file) => {
          const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
          return {
            filename: file.name || 'image',
            data: base64,
            mimetype: file.mimeType || 'image/jpeg',
          };
        })
      );
      
  
      if (attachments.length + newAttachments.length > 5) {
        Alert.alert('Limit Exceeded', 'You can only attach up to 5 files');
        return;
      }
  
      setAttachments([...attachments, ...newAttachments]);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const toggleRemoveServerAttachment = (path: string) => {
    if (removingAttachments.includes(path)) {
      setRemovingAttachments(removingAttachments.filter(a => a !== path));
    } else {
      setRemovingAttachments([...removingAttachments, path]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }
  
    if (!token) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }
  
    try {
      setLoading(true);
  
      // Prepare the payload
      const payload = {
        title,
        content,
        attachments, // already array of { filename, data, mimetype }
      };
      
      console.log('Submitting post:', JSON.stringify(payload).slice(0, 500)); // Don't log full base64!
      console.log('First attachment:', attachments[0]);
      if (editingPost) {
        // PATCH for editing
        await axios.patch(`${API_URL}/posts/${editingPost._id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Alert.alert('Success', 'Post updated successfully');
      } else {
        // POST for new post
        await axios.post(`${API_URL}/posts`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Alert.alert('Success', 'Post created successfully');
      }
  
      // Reset form
      setTitle('');
      setContent('');
      setAttachments([]);
      setEditingPost(null);
      setRemovingAttachments([]);
      setShowForm(false);
  
      fetchPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      Alert.alert('Error', 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setAttachments([]);
    setRemovingAttachments([]);
    setShowForm(true);
  };

  
const handleDelete = async (postId: string) => {
  try {
  if (!token) {
  Alert.alert('Error', 'You must be logged in to delete a post');
  return;
  }
  Alert.alert(
  'Confirm Delete',
  'Are you sure you want to delete this post?',
  [
  { text: 'Cancel', style: 'cancel' },
  {
  text: 'Delete',
  style: 'destructive',
  onPress: async () => {
  setLoading(true);
  await axios.delete(`${API_URL}/posts/${postId}`, {
  headers: {
  'Authorization': `Bearer ${token}`
  }
  });
  
  Alert.alert('Success', 'Post deleted successfully');
  fetchPosts();
  }
  }
  ]
  );
  } catch (error) {
  console.error('Error deleting post:', error);
  Alert.alert('Error', 'Failed to delete post');
  } finally {
  setLoading(false);
  }
  };
  
  const router = useRouter();

  const viewPostDetails = (post: Post) => {
    router.push({
      pathname: '/community/[postId]',
      params: { postId: post._id }
    });
  };

  const renderAttachmentPreview = (attachment: Attachment, index: number, isServerAttachment = false) => {
    const isImage = attachment.mimetype && attachment.mimetype.startsWith('image/');
    const fileName = attachment.filename || 'Attachment';
    const uri = isImage
      ? `data:${attachment.mimetype};base64,${attachment.data}`
      : undefined;
  
    return (
      <View key={index} className="flex-row items-center p-2 m-1 bg-gray-100 rounded-md">
        {isImage ? (
          <Image source={{ uri }} className="w-10 h-10 rounded" />
        ) : (
          <Ionicons name="document-outline" size={24} color="#666" />
        )}
        <Text className="ml-2 flex-1 text-sm">{fileName}</Text>
        {!isServerAttachment && (
          <TouchableOpacity onPress={() => removeAttachment(index)}>
            <Ionicons name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  

  const renderPostItem = ({ item }: { item: Post }) => {
    const isOwner = userId === item.user._id;
    const hasAttachments = item.attachments && item.attachments.length > 0;
  
    return (
      <View className="bg-white rounded-xl shadow px-4 py-3 mb-4">
        <View className="flex-row items-center mb-2">
          {/* Avatar placeholder */}
          <View className="w-8 h-8 rounded-full bg-green-200 mr-2" />
          <View>
            <Text className="font-semibold">{item.user.username}</Text>
            <Text className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          {isOwner && (
            <View className="flex-row ml-auto">
              <TouchableOpacity onPress={() => handleEdit(item)} className="mr-2">
                <Ionicons name="create-outline" size={20} color="#16a34a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
  
        {/* Post Content (clickable) */}
        <TouchableOpacity onPress={() => viewPostDetails(item)}>
          <Text className="mb-2">{item.content}</Text>
        </TouchableOpacity>
  
        {/* Attachments (clickable) */}
        {hasAttachments && (
  <View className="flex-row flex-wrap mb-2">
    {item.attachments.slice(0, 1).map((attachment, index) => {
      const isImage = attachment.mimetype && attachment.mimetype.startsWith('image/');
      const uri = isImage
        ? `data:${attachment.mimetype};base64,${attachment.data}`
        : undefined;
      return (
        <TouchableOpacity key={index} onPress={() => viewPostDetails(item)} className="w-full">
          {isImage ? (
            <Image
              source={{ uri }}
              className="w-full h-32 rounded mb-2"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-32 bg-green-100 rounded items-center justify-center mb-2">
              <Ionicons name="document" size={28} color="#16a34a" />
              <Text>{attachment.filename}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
)}

      </View>
    );
  };
  
  

  return (

    <>
    <CommunityFeedBanner />
    <FeedTabs />
    <View className="flex-1 bg-gray-100 p-4">

      {!showForm ? (
  <View className="bg-white rounded-xl shadow px-4 py-3 mb-4 flex-row items-center">
    <TouchableOpacity
      onPress={() => setShowForm(true)}
      className="flex-1"
    >
      <Text className="text-gray-500">Share your recycling journey...</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={pickDocument} className="ml-2">
      <Ionicons name="image-outline" size={22} color="#16a34a" /> {/* Green */}
    </TouchableOpacity>
  </View>
) : (
        <View className="bg-white p-4 rounded-lg shadow mb-4">
          <Text className="text-xl font-bold mb-4">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </Text>
          
          <TextInput
            className="border border-gray-300 p-3 rounded-md mb-3"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            className="border border-gray-300 p-3 rounded-md mb-3 h-24"
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            onPress={pickDocument}
            className="bg-gray-200 p-3 rounded-md mb-3 items-center"
          >
            <Text className="text-gray-700">Attach Files (Max 5)</Text>
          </TouchableOpacity>
          
          {/* Display local attachments */}
          {attachments.length > 0 && (
            <View className="mb-3">
              <Text className="font-bold mb-1">New Attachments:</Text>
              {attachments.map((attachment, index) => 
                renderAttachmentPreview(attachment, index)
              )}
            </View>
          )}

          {/* Display existing attachments when editing */}
          {editingPost && editingPost.attachments && editingPost.attachments.length > 0 && (
            <View className="mb-3">
              <Text className="font-bold mb-1">Current Attachments:</Text>
              {editingPost.attachments.map((attachment, index) => 
                renderAttachmentPreview(attachment, index, true)
              )}
            </View>
          )}
          
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={() => {
                setShowForm(false);
                setTitle('');
                setContent('');
                setAttachments([]);
                setEditingPost(null);
                setRemovingAttachments([]);
              }}
              className="bg-gray-300 p-3 rounded-md mr-2"
            >
              <Text className="text-gray-700">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-green-400 p-3 rounded-md"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-10">
              <Text className="text-gray-500 text-lg">No posts found</Text>
            </View>
          }
        />
      )}
    </View>
    </>
  );
  };
import { useLocalSearchParams } from 'expo-router';
// Post Detail Component with Comments
const PostDetailScreen = () => {
  //const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  
  const { postId } = useLocalSearchParams<{ postId: string }>();
  useEffect(() => {
    const getAuthData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setToken(parsedUserData.token);
          setUserId(parsedUserData.id);
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
      }
    };
  
    getAuthData();
  }, []);
  
  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [postId]);
  
  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
      Alert.alert('Error', 'Failed to load post details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    }
  };
  
  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      return;
    }
    
    if (!token) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }
    
    try {
      const commentData = {
        postId,
        content: commentContent,
        parentId: replyingTo
      };
      
      await axios.post(`${API_URL}/comments`, commentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCommentContent('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentContent(comment.content);
  };
  
  const handleUpdateComment = async () => {
    if (!token || !editingCommentId) return;
    try {
      await axios.patch(`${API_URL}/comments/${editingCommentId}`, { content: editingCommentContent }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEditingCommentId(null);
      setEditingCommentContent('');
      fetchComments();
    } catch (error) {
      Alert.alert('Error', 'Failed to update comment');
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      if (!token) {
        Alert.alert('Error', 'You must be logged in to delete a comment');
        return;
      }
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this comment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await axios.delete(`${API_URL}/comments/${commentId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              setComments(prev => prev.filter(comment => comment._id !== commentId));
              fetchComments();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
      fetchComments();
    }
  };
  
  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = userId === comment.user._id;
    
    return (
      <View key={comment._id} className={`mb-3 ${isReply ? 'ml-8' : ''}`}>
        <View className="bg-white p-3 rounded-lg shadow-sm">
        <View className="flex-row items-center">
  <Text className="font-bold">{comment.user.username}</Text>
  {isOwner && (
    <View className="flex-row ml-auto">
      <TouchableOpacity onPress={() => handleEditComment(comment)} className="mr-2">
        <Ionicons name="create-outline" size={18} color="#16a34a" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteComment(comment._id)}>
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  )}
</View>
    {editingCommentId === comment._id ? (
      <View>
        <TextInput
          className="border border-gray-300 p-2 rounded mb-2"
          value={editingCommentContent}
          onChangeText={setEditingCommentContent}
          multiline
          autoFocus
        />
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={() => {
              setEditingCommentId(null);
              setEditingCommentContent('');
            }}
            className="bg-gray-300 px-3 py-1 rounded mr-2"
          >
            <Text className="text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateComment}
            className="bg-indigo-600 px-3 py-1 rounded"
            disabled={!editingCommentContent.trim()}
          >
            <Text className="text-white">Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <Text className="mt-1">{comment.content}</Text>
    )}

          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(comment._id)}>
              <Text className="text-xs text-blue-500">Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {comment.replies && comment.replies.length > 0 && (
          <View className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </View>
        )}
      </View>
    );
  };
  
  const renderAttachment = (attachment: Attachment) => {
    const isImage = attachment.mimetype && attachment.mimetype.startsWith('image/');
    const fileName = attachment.filename || 'file';
    const uri = isImage
      ? `data:${attachment.mimetype};base64,${attachment.data}`
      : undefined;
  
    if (isImage) {
      return (
        <Image 
          source={{ uri }}
          className="w-full h-48 mb-3 rounded"
          resizeMode="cover"
        />
      );
    }
  
    return (
      <TouchableOpacity 
        className="flex-row items-center p-3 bg-gray-100 rounded-md mb-3"
        onPress={() => {
          Alert.alert('Download', `Download ${fileName}?`);
        }}
      >
        <Ionicons name="document-outline" size={24} color="#666" />
        <Text className="ml-2 flex-1">{fileName}</Text>
        <Ionicons name="download-outline" size={24} color="#4F46E5" />
      </TouchableOpacity>
    );
  };
  
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }
  
  if (!post) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-700">Post not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Post Content */}
        <View className="bg-white rounded-xl shadow px-4 py-3 mb-4">
  <View className="flex-row items-center mb-2">
    {/* Avatar placeholder */}
    <View className="w-8 h-8 rounded-full bg-green-200 mr-2" />
    <View>
      <Text className="font-semibold">{post.user.username}</Text>
      <Text className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</Text>
    </View>
  </View>
  <Text className="text-xl font-bold mb-2">{post.title}</Text>
  <Text className="mb-2">{post.content}</Text>
  {/* Attachments */}
  {post.attachments && post.attachments.length > 0 && (
  <View className="flex-row flex-wrap mb-2">
    {post.attachments.slice(0, 1).map((attachment, index) => (
  <View key={index} className="w-full">
    {renderAttachment(attachment)}
  </View>
))}

  </View>
)}

</View>

        
        {/* Comments Section */}
        <View className="bg-white p-4 rounded-lg shadow mb-4">
          <Text className="text-xl font-bold mb-4">Comments</Text>
          
          {/* Add Comment Form */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 border border-gray-300 p-3 rounded-md"
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                value={commentContent}
                onChangeText={setCommentContent}
                multiline
              />
          <TouchableOpacity 
            onPress={handleAddComment}
            className="ml-2 bg-green-600 p-3 rounded-md"
            disabled={!commentContent.trim()}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>

            </View>
            
            {replyingTo && (
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500">Replying to a comment</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)} className="ml-2">
                  <Text className="text-sm text-red-500">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Comments List */}
          {comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <Text className="text-gray-500 text-center py-4">No comments yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export { PostsScreen, PostDetailScreen };

