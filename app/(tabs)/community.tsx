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
// Define types
interface Attachment {
  uri: string;
  name: string;
  type: string;
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
  attachments: string[];
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
        type: ['image/*', 'application/pdf', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'application/vnd.ms-excel', 
               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'text/plain'],
        multiple: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      // Handle multiple files
      const newAttachments = result.assets.map(file => ({
        uri: file.uri,
        name: file.name || 'file',
        type: file.mimeType || 'application/octet-stream',
      }));
      
      // Check if adding these would exceed the 5 file limit
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
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      attachments.forEach(file => {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });
      
      if (editingPost) {
        if (removingAttachments.length > 0) {
          formData.append('removeAttachments', JSON.stringify(removingAttachments));
        }
        
        await axios.patch(`${API_URL}/posts/${editingPost._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        Alert.alert('Success', 'Post updated successfully');
      } else {
        await axios.post(`${API_URL}/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
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
      
      // Refresh posts
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
      pathname: '/communityfolder/[postId]', // This matches your file structure
      params: { postId: post._id }
    });
  };

  const renderAttachmentPreview = (uri: string, index: number, isServerFile = false) => {
    const isImage = uri.match(/\.(jpeg|jpg|png|gif)$/i);
    const fileName = uri.split('/').pop() || 'file';
    
    if (isServerFile && removingAttachments.includes(uri)) {
      return (
        <View key={index} className="flex-row items-center p-2 m-1 bg-gray-200 rounded-md opacity-50">
          {isImage ? (
            <Image source={{ uri: API_URL + uri }} className="w-10 h-10 rounded" />
          ) : (
            <Ionicons name="document-outline" size={24} color="#666" />
          )}
          <Text className="ml-2 flex-1 text-sm text-gray-500">{fileName}</Text>
          <TouchableOpacity onPress={() => toggleRemoveServerAttachment(uri)}>
            <Ionicons name="add-circle" size={24} color="green" />
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View key={index} className="flex-row items-center p-2 m-1 bg-gray-100 rounded-md">
        {isImage ? (
          isServerFile ? (
            <Image source={{ uri: API_URL + uri }} className="w-10 h-10 rounded" />
          ) : (
            <Image source={{ uri }} className="w-10 h-10 rounded" />
          )
        ) : (
          <Ionicons name="document-outline" size={24} color="#666" />
        )}
        <Text className="ml-2 flex-1 text-sm">{fileName}</Text>
        <TouchableOpacity 
          onPress={isServerFile 
            ? () => toggleRemoveServerAttachment(uri) 
            : () => removeAttachment(index)
          }
        >
          <Ionicons name="close-circle" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const isOwner = userId === item.user._id;
    const hasAttachments = item.attachments && item.attachments.length > 0;
    
    return (
      <View className="bg-white p-4 mb-4 rounded-lg shadow">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold">{item.title}</Text>
          {isOwner && (
            <View className="flex-row">
              <TouchableOpacity onPress={() => handleEdit(item)} className="mr-2">
                <Ionicons name="create-outline" size={24} color="#4F46E5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Text className="text-gray-500 mb-2">Posted by {item.user.username}</Text>
        
        <Text className="mb-3" numberOfLines={3}>
          {item.content}
        </Text>
        
        {hasAttachments && (
          <View className="flex-row flex-wrap mb-3">
            {item.attachments.slice(0, 3).map((attachment, index) => {
              const isImage = attachment.match(/\.(jpeg|jpg|png|gif)$/i);
              return isImage ? (
                <Image 
                  key={index}
                  source={{ uri: API_URL + attachment }} 
                  className="w-16 h-16 mr-2 mb-2 rounded" 
                />
              ) : (
                <View key={index} className="w-16 h-16 mr-2 mb-2 bg-gray-200 rounded items-center justify-center">
                  <Ionicons name="document" size={24} color="#666" />
                </View>
              );
            })}
            {item.attachments.length > 3 && (
              <View className="w-16 h-16 bg-gray-200 rounded items-center justify-center">
                <Text className="text-gray-600">+{item.attachments.length - 3}</Text>
              </View>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          onPress={() => viewPostDetails(item)}
          className="bg-indigo-500 py-2 px-4 rounded-md self-start"
        >
          <Text className="text-white">View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {!showForm ? (
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          className="bg-indigo-600 p-3 rounded-md mb-4 items-center"
        >
          <Text className="text-white font-bold">Create New Post</Text>
        </TouchableOpacity>
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
                renderAttachmentPreview(attachment.uri, index)
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
              className="bg-indigo-600 p-3 rounded-md"
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
  );
};

// Post Detail Component with Comments
const PostDetailScreen: React.FC<{ route: { params: { postId: string } } }> = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        setToken(storedToken);
        setUserId(storedUserId);
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
              
              fetchComments();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };
  
  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = userId === comment.user._id;
    
    return (
      <View key={comment._id} className={`mb-3 ${isReply ? 'ml-8' : ''}`}>
        <View className="bg-white p-3 rounded-lg shadow-sm">
          <View className="flex-row justify-between">
            <Text className="font-bold">{comment.user.username}</Text>
            {isOwner && (
              <TouchableOpacity onPress={() => handleDeleteComment(comment._id)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="mt-1">{comment.content}</Text>
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
  
  const renderAttachment = (attachment: string) => {
    const isImage = attachment.match(/\.(jpeg|jpg|png|gif)$/i);
    const fileName = attachment.split('/').pop() || 'file';
    
    if (isImage) {
      return (
        <Image 
          source={{ uri: API_URL + attachment }} 
          className="w-full h-48 mb-3 rounded"
          resizeMode="cover"
        />
      );
    }
    
    return (
      <TouchableOpacity 
        className="flex-row items-center p-3 bg-gray-100 rounded-md mb-3"
        onPress={() => {
          // Open file using a document viewer or download it
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
        <View className="bg-white p-4 rounded-lg shadow mb-4">
          <Text className="text-2xl font-bold mb-2">{post.title}</Text>
          <Text className="text-gray-500 mb-4">
            Posted by {post.user.username} • {new Date(post.createdAt).toLocaleDateString()}
          </Text>
          
          <Text className="mb-4">{post.content}</Text>
          
          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <View className="mb-4">
              <Text className="font-bold mb-2">Attachments:</Text>
              {post.attachments.map((attachment, index) => (
                <View key={index}>
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
                className="ml-2 bg-indigo-600 p-3 rounded-md"
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

