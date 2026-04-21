import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useOrg } from './OrgContext';

/**
 * useSocialContext — internal hook, consumed only by MarketingProvider.
 * Owns social posts CRUD with optimistic updates.
 * Extracted from MarketingContext (Phase 4).
 *
 * @param {string|null} selectedProjectId — passed in from MarketingProvider local state
 */
export function useSocialContext(selectedProjectId) {
    const { orgId } = useOrg();

    const [socialPosts, setSocialPosts] = useState([]);
    const [socialPostsLoading, setSocialPostsLoading] = useState(true);

    const fetchSocialPosts = useCallback(async () => {
        if (!orgId) { setSocialPosts([]); setSocialPostsLoading(false); return; }
        setSocialPostsLoading(true);
        try {
            const data = await api.get('/marketing/social-studio/posts');
            setSocialPosts(data || []);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setSocialPosts([]);
        }
        setSocialPostsLoading(false);
    }, [orgId]);

    useEffect(() => { fetchSocialPosts(); }, [fetchSocialPosts]);

    const addSocialPost = async (post) => {
        if (!orgId) return null;
        // Optimistic update
        const tempId = crypto.randomUUID();
        const optimistic = { ...post, id: tempId, org_id: orgId, created_at: new Date().toISOString() };
        setSocialPosts(prev => [optimistic, ...prev]);

        try {
            const data = await api.post('/marketing/social-studio/posts', {
                projectId: selectedProjectId || null,
                platform: Array.isArray(post.platforms) && post.platforms.length > 0 ? String(post.platforms[0]).toLowerCase() : (post.platform || null),
                content: post.content,
                postType: post.type || post.post_type || 'image',
                status: post.status || 'draft',
                scheduledFor: post.scheduledFor || post.scheduled_for || null,
                platforms: post.platforms || [],
                mediaUrls: post.mediaUrls || post.media_urls || []
            });
            // Replace optimistic with real row
            if (data) {
                setSocialPosts(prev => prev.map(p => p.id === tempId ? data : p));
                return data;
            }
        } catch (err) {
            console.error('Failed to create post:', err);
        }
        
        // Rollback on error or no data
        setSocialPosts(prev => prev.filter(p => p.id !== tempId));
        return null;
    };

    const deleteSocialPost = async (postId) => {
        // Optimistic removal
        setSocialPosts(prev => prev.filter(p => p.id !== postId));
        try {
            await api.delete(`/marketing/social-studio/posts/${postId}`);
        } catch (err) {
            console.error('Failed to delete post:', err);
            // Rollback: refetch on failure
            fetchSocialPosts();
        }
    };

    const updateSocialPost = async (postId, updates) => {
        setSocialPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
        try {
            const payload = { ...updates };
            if (payload.post_type) { payload.postType = payload.post_type; delete payload.post_type; }
            if (payload.scheduled_for) { payload.scheduledFor = payload.scheduled_for; delete payload.scheduled_for; }
            if (payload.media_urls) { payload.mediaUrls = payload.media_urls; delete payload.media_urls; }

            const data = await api.put(`/marketing/social-studio/posts/${postId}`, payload);
            if (data) setSocialPosts(prev => prev.map(p => p.id === postId ? data : p));
        } catch (err) {
            console.error('Failed to update post:', err);
            // Rollback by refetching
            fetchSocialPosts();
        }
    };

    const approveSocialPost = async (postId) => {
        try {
            const data = await api.post(`/marketing/social-studio/posts/${postId}/approve`, {});
            if (data) setSocialPosts(prev => prev.map(p => p.id === postId ? data : p));
            return data;
        } catch (err) {
            console.error('Failed to approve social post:', err);
            return null;
        }
    };

    const publishSocialPost = async (postId) => {
        try {
            const data = await api.post(`/marketing/social-studio/posts/${postId}/publish`, {});
            if (data) setSocialPosts(prev => prev.map(p => p.id === postId ? data : p));
            return data;
        } catch (err) {
            console.error('Failed to publish social post:', err);
            return null;
        }
    };

    return {
        socialPosts,
        socialPostsLoading,
        addSocialPost,
        updateSocialPost,
        deleteSocialPost,
        approveSocialPost,
        publishSocialPost,
    };
}
