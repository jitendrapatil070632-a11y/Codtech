// ========== VIDEO PLAYER FUNCTIONS ==========

// Global video players object
const videoPlayers = {};

// Initialize all videos on page
function initializeVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video, index) => {
        const playerId = `player_${index}`;
        video.id = playerId;
        videoPlayers[playerId] = {
            element: video,
            isPlaying: false,
            isMuted: false
        };
        
        // Add event listeners
        video.addEventListener('play', () => onVideoPlay(video.id));
        video.addEventListener('pause', () => onVideoPause(video.id));
        video.addEventListener('timeupdate', () => onVideoTimeUpdate(video.id));
        video.addEventListener('ended', () => onVideoEnded(video.id));
        
        // Initialize progress tracking
        if (video.parentElement.querySelector('.progress-fill')) {
            updateVideoProgress(video.id);
        }
    });
}

// Toggle play/pause
function togglePlayPause(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;
    
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}

// Toggle mute
function toggleMute(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;
    
    video.muted = !video.muted;
    const icon = document.querySelector(`#${videoId.replace('hero', 'heroVolume')}`);
    if (icon) {
        icon.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
}

// Toggle fullscreen
function toggleFullscreen(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;
    
    if (!document.fullscreenElement) {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Seek video
function seekVideo(videoId, event) {
    const video = document.getElementById(videoId);
    if (!video) return;
    
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const percentage = clickPosition / progressBarWidth;
    
    video.currentTime = percentage * video.duration;
}

// Initialize video progress tracking
function initializeVideoProgress(videoId, progressBarId = null) {
    const video = document.getElementById(videoId);
    if (!video) return;
    
    const progressBar = progressBarId 
        ? document.getElementById(progressBarId) 
        : video.parentElement.querySelector('.progress-fill');
    
    if (!progressBar) return;
    
    video.addEventListener('timeupdate', function() {
        if (video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Update time display if exists
            const timeDisplay = video.parentElement.querySelector('.video-time');
            if (timeDisplay) {
                const currentTime = formatTime(video.currentTime);
                const duration = formatTime(video.duration);
                timeDisplay.textContent = `${currentTime} / ${duration}`;
            }
        }
    });
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Video event handlers
function onVideoPlay(videoId) {
    const playIcon = document.querySelector(`#${videoId.replace('Video', 'PlayIcon')}`);
    if (playIcon) {
        playIcon.className = 'fas fa-pause';
    }
    
    if (videoPlayers[videoId]) {
        videoPlayers[videoId].isPlaying = true;
    }
}

function onVideoPause(videoId) {
    const playIcon = document.querySelector(`#${videoId.replace('Video', 'PlayIcon')}`);
    if (playIcon) {
        playIcon.className = 'fas fa-play';
    }
    
    if (videoPlayers[videoId]) {
        videoPlayers[videoId].isPlaying = false;
    }
}

function onVideoTimeUpdate(videoId) {
    // Update progress bars automatically handled by initializeVideoProgress
}

function onVideoEnded(videoId) {
    const playIcon = document.querySelector(`#${videoId.replace('Video', 'PlayIcon')}`);
    if (playIcon) {
        playIcon.className = 'fas fa-play';
    }
    
    // Reset overlay for course videos
    const overlay = document.querySelector(`[onclick*="${videoId}"]`);
    if (overlay) {
        overlay.style.opacity = '1';
    }
}

// Video Modal Functions
function openVideoModal(videoId) {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const originalVideo = document.getElementById(videoId);
    
    if (!modal || !modalVideo || !originalVideo) return;
    
    // Clone the video source
    modalVideo.src = originalVideo.src;
    modalVideo.load();
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Play video
    modalVideo.play();
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    
    if (modal && modalVideo) {
        modalVideo.pause();
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all videos
    initializeVideos();
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
    
    // Close modal on outside click
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('videoModal');
        if (modal && e.target === modal) {
            closeVideoModal();
        }
    });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            if (navLinks) navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navActions) navActions.style.display = navActions.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Course card interactions
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const video = this.querySelector('.course-video');
            if (video && !video.played.length) {
                video.currentTime = 10; // Start at 10 seconds for preview
            }
        });
    });
});

// Export functions for HTML onclick
window.togglePlayPause = togglePlayPause;
window.toggleMute = toggleMute;
window.toggleFullscreen = toggleFullscreen;
window.seekVideo = seekVideo;
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
window.playCourseVideo = function(element) {
    const video = element.parentElement.querySelector('.course-video');
    if (video) {
        video.play();
        element.style.opacity = '0';
    }
};