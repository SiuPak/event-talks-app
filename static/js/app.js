document.addEventListener('DOMContentLoaded', () => {
    // State management
    let allUpdates = [];
    let filteredUpdates = [];
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Tweet composer state
    let selectedUpdate = null;
    
    // DOM Elements
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const lastUpdatedText = document.getElementById('last-updated-text');
    const feedContent = document.getElementById('feed-content');
    const feedSkeleton = document.getElementById('feed-skeleton');
    const feedEmpty = document.getElementById('feed-empty');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const filterWrapper = document.getElementById('filter-wrapper');
    
    const warningBanner = document.getElementById('warning-banner');
    const warningBannerText = document.getElementById('warning-banner-text');
    
    // Stats elements
    const statTotalCount = document.getElementById('stat-total-count');
    const statFeaturesCount = document.getElementById('stat-features-count');
    const statIssuesCount = document.getElementById('stat-issues-count');
    const statAnnouncementsCount = document.getElementById('stat-announcements-count');
    
    // Badges elements
    const badgeAll = document.getElementById('badge-all');
    const badgeFeature = document.getElementById('badge-feature');
    const badgeAnnouncement = document.getElementById('badge-announcement');
    const badgeIssue = document.getElementById('badge-issue');
    const badgeDeprecated = document.getElementById('badge-deprecated');
    
    // Modal elements
    const tweetModal = document.getElementById('tweet-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const tweetSubmitBtn = document.getElementById('tweet-submit-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const tweetCounterText = document.getElementById('tweet-counter-text');
    const progressCircle = document.querySelector('.progress-ring__circle');
    
    // Initialize Progress Ring
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    // Fetch and Load Updates
    async function fetchUpdates(forceRefresh = false) {
        try {
            showLoading(true);
            warningBanner.style.display = 'none';
            
            const url = forceRefresh ? '/api/updates?refresh=true' : '/api/updates';
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.error);
            }
            
            allUpdates = data.updates;
            
            // Handle last updated timestamp
            if (data.last_updated) {
                const date = new Date(data.last_updated * 1000);
                lastUpdatedText.textContent = `Sync: ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            }
            
            // Handle warnings
            if (data.warning) {
                warningBannerText.textContent = data.warning;
                warningBanner.style.display = 'flex';
            }
            
            // Update global stats
            updateStatsAndBadges(allUpdates);
            
            // Apply current filters/search
            applyFiltersAndSearch();
            
        } catch (error) {
            console.error('Fetch error:', error);
            warningBannerText.textContent = `Error: ${error.message}. Please try again later.`;
            warningBanner.style.display = 'flex';
            showEmptyState(true);
        } finally {
            showLoading(false);
        }
    }

    // Toggle Loading Animation
    function showLoading(isLoading) {
        if (isLoading) {
            feedSkeleton.style.display = 'block';
            feedContent.style.display = 'none';
            feedEmpty.style.display = 'none';
            refreshBtn.classList.add('spinning');
            refreshBtn.disabled = true;
        } else {
            feedSkeleton.style.display = 'none';
            feedContent.style.display = 'flex';
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    }

    // Update Dashboard Metrics and Filter Badges
    function updateStatsAndBadges(updates) {
        // Counts for overall feed
        const total = updates.length;
        const features = updates.filter(u => u.type.toLowerCase() === 'feature').length;
        const issues = updates.filter(u => u.type.toLowerCase() === 'issue').length;
        const announcements = updates.filter(u => u.type.toLowerCase() === 'announcement').length;
        const deprecated = updates.filter(u => u.type.toLowerCase() === 'deprecated').length;
        
        // Update stats
        statTotalCount.textContent = total;
        statFeaturesCount.textContent = features;
        statIssuesCount.textContent = issues;
        statAnnouncementsCount.textContent = announcements;
        
        // Update badges
        badgeAll.textContent = total;
        badgeFeature.textContent = features;
        badgeAnnouncement.textContent = announcements;
        badgeIssue.textContent = issues;
        badgeDeprecated.textContent = deprecated;
    }

    // Filters and Search Application Logic
    function applyFiltersAndSearch() {
        filteredUpdates = allUpdates.filter(update => {
            // 1. Type Filter
            const typeMatch = currentFilter === 'all' || 
                update.type.toLowerCase() === currentFilter.toLowerCase();
            
            // 2. Keyword Search Match
            const cleanQuery = searchQuery.trim().toLowerCase();
            if (!cleanQuery) return typeMatch;
            
            const searchMatch = 
                update.date.toLowerCase().includes(cleanQuery) ||
                update.type.toLowerCase().includes(cleanQuery) ||
                update.description_text.toLowerCase().includes(cleanQuery);
                
            return typeMatch && searchMatch;
        });
        
        renderFeed(filteredUpdates);
    }

    // Render updates grouped by date
    function renderFeed(updates) {
        feedContent.innerHTML = '';
        
        if (updates.length === 0) {
            showEmptyState(true);
            return;
        }
        
        showEmptyState(false);
        
        // Group by Date
        const grouped = {};
        updates.forEach(update => {
            if (!grouped[update.date]) {
                grouped[update.date] = [];
            }
            grouped[update.date].push(update);
        });
        
        // Create Date Group DOM Elements
        Object.keys(grouped).forEach(date => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            
            const dateTitle = document.createElement('h2');
            dateTitle.className = 'date-title';
            dateTitle.textContent = date;
            
            const dateLine = document.createElement('div');
            dateLine.className = 'date-line';
            
            dateHeader.appendChild(dateTitle);
            dateHeader.appendChild(dateLine);
            dateGroup.appendChild(dateHeader);
            
            grouped[date].forEach(update => {
                const card = createUpdateCard(update);
                dateGroup.appendChild(card);
            });
            
            feedContent.appendChild(dateGroup);
        });
    }

    // Show/Hide Empty State
    function showEmptyState(show) {
        if (show) {
            feedEmpty.style.display = 'block';
            feedContent.style.display = 'none';
        } else {
            feedEmpty.style.display = 'none';
            feedContent.style.display = 'flex';
        }
    }

    // Create DOM card element for a single update
    function createUpdateCard(update) {
        const card = document.createElement('article');
        card.className = 'update-card';
        card.id = `card-${update.id}`;
        
        const typeClass = update.type.toLowerCase();
        
        // Set type badge icon
        let typeIcon = 'bi-info-circle';
        if (typeClass === 'feature') typeIcon = 'bi-star';
        if (typeClass === 'announcement') typeIcon = 'bi-megaphone';
        if (typeClass === 'issue') typeIcon = 'bi-exclamation-triangle';
        if (typeClass === 'deprecated') typeIcon = 'bi-trash';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="type-pill ${typeClass}">
                    <i class="bi ${typeIcon}"></i> ${update.type}
                </span>
                <div class="card-actions">
                    <button class="card-btn copy-btn" aria-label="Copy update text to clipboard">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button class="card-btn tweet-btn" data-id="${update.id}" aria-label="Tweet this update">
                        <i class="bi bi-twitter-x"></i> Share to X
                    </button>
                    <a href="${update.link}" target="_blank" rel="noopener noreferrer" class="card-btn link-btn" aria-label="View official release notes">
                        <i class="bi bi-box-arrow-up-right"></i> Docs
                    </a>
                </div>
            </div>
            <div class="card-body">
                ${update.description_html}
            </div>
        `;
        
        // Add Copy click listener
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            navigator.clipboard.writeText(update.description_text).then(() => {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = `<i class="bi bi-clipboard-check"></i> Copied!`;
                btn.style.color = '#10b981'; // Green feedback
                btn.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });

        // Add Tweet click listener
        card.querySelector('.tweet-btn').addEventListener('click', () => {
            openTweetModal(update);
        });
        
        return card;
    }

    // Tweet Modal Logic
    function openTweetModal(update) {
        selectedUpdate = update;
        
        // Generate nice preview text
        const defaultTweet = generateDefaultTweet(update);
        tweetTextarea.value = defaultTweet;
        
        // Open modal
        tweetModal.classList.add('active');
        tweetTextarea.focus();
        
        // Trigger character count check
        updateCharCount();
    }

    function closeTweetModal() {
        tweetModal.classList.remove('active');
        selectedUpdate = null;
    }

    function generateDefaultTweet(update) {
        const date = update.date;
        const type = update.type;
        const link = update.link;
        
        // Clean text by replacing double newlines/tabs and collapsing spaces
        let descText = update.description_text
            .replace(/\s+/g, ' ')
            .replace(/Learn more\./i, '')
            .trim();
            
        const prefix = `📢 BigQuery Update (${date}) • ${type}:\n`;
        const suffix = `\n\n🔗 ${link} #BigQuery #GCP`;
        
        const availableLength = 280 - prefix.length - suffix.length;
        
        if (descText.length > availableLength) {
            // Truncate at word boundary
            let truncated = descText.substring(0, availableLength - 3);
            const lastSpace = truncated.lastIndexOf(' ');
            if (lastSpace > availableLength * 0.8) {
                truncated = truncated.substring(0, lastSpace);
            }
            descText = truncated + '...';
        }
        
        return `${prefix}${descText}${suffix}`;
    }

    function updateCharCount() {
        const text = tweetTextarea.value;
        const remaining = 280 - text.length;
        
        tweetCounterText.textContent = remaining;
        
        // Compute circular offset
        const percentage = Math.min((text.length / 280) * 100, 100);
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        
        // Style character counter based on remaining limit
        if (remaining < 0) {
            tweetCounterText.style.color = '#ef4444'; // Red
            progressCircle.style.stroke = '#ef4444';
            tweetSubmitBtn.disabled = true;
            tweetSubmitBtn.style.opacity = '0.5';
            tweetSubmitBtn.style.cursor = 'not-allowed';
        } else if (remaining <= 20) {
            tweetCounterText.style.color = '#f59e0b'; // Amber
            progressCircle.style.stroke = '#f59e0b';
            tweetSubmitBtn.disabled = false;
            tweetSubmitBtn.style.opacity = '1';
            tweetSubmitBtn.style.cursor = 'pointer';
        } else {
            tweetCounterText.style.color = '#94a3b8'; // Default slate
            progressCircle.style.stroke = '#3b82f6'; // Blue
            tweetSubmitBtn.disabled = false;
            tweetSubmitBtn.style.opacity = '1';
            tweetSubmitBtn.style.cursor = 'pointer';
        }
    }

    function submitTweet() {
        const text = tweetTextarea.value;
        if (text.length > 280) return;
        
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
        closeTweetModal();
    }

    // Event Listeners
    
    // Refresh Button Click
    refreshBtn.addEventListener('click', () => {
        fetchUpdates(true);
    });
    
    // Live Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        
        // Show/hide search clear button
        if (searchQuery.length > 0) {
            searchClearBtn.style.display = 'flex';
        } else {
            searchClearBtn.style.display = 'none';
        }
        
        applyFiltersAndSearch();
    });
    
    // Clear search
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        applyFiltersAndSearch();
        searchInput.focus();
    });
    
    // Filter Pills Click
    filterWrapper.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-pill');
        if (!button) return;
        
        // Toggle active status
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        currentFilter = button.dataset.type;
        applyFiltersAndSearch();
    });
    
    // Reset filters empty state button
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById('filter-all').classList.add('active');
        currentFilter = 'all';
        
        applyFiltersAndSearch();
    });
    
    // Export to CSV helper
    function exportToCSV(updates) {
        const headers = ['Date', 'Category', 'Description', 'Link'];
        const rows = updates.map(u => [
            u.date,
            u.type,
            u.description_text,
            u.link
        ]);
        
        // Escape values for CSV (double quotes and duplicate internal quotes)
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `bigquery_release_notes_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal Event listeners
    modalCloseBtn.addEventListener('click', closeTweetModal);
    modalCancelBtn.addEventListener('click', closeTweetModal);
    tweetSubmitBtn.addEventListener('click', submitTweet);
    tweetTextarea.addEventListener('input', updateCharCount);
    
    // Export CSV click event listener
    exportCsvBtn.addEventListener('click', () => {
        if (filteredUpdates.length === 0) {
            alert("No updates to export!");
            return;
        }
        exportToCSV(filteredUpdates);
    });
    
    // Close modal on click outside modal card
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });
    
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tweetModal.classList.contains('active')) {
            closeTweetModal();
        }
    });

    // Run Initial Load
    fetchUpdates(false);
});
