// R20 Competition - Client-side JavaScript
$(document).ready(function() {
    // List of winning serial numbers (client-side validation)
    const winningNumbers = [
        'AH28519618B', 'AH28519616B', 'AH28519613B', 'AH28519611B', 'AH28519609B',
        'AH28519607B', 'AH28519605B', 'AH28519603B', 'AH27519700B', 'AH27519697B',
        'AH27519695B', 'AH27519693B', 'AH27519691B', 'AH27519689B', 'AH27519687B',
        'AH27519682B', 'AH27519679B', 'AH27519675B', 'AH27519673B', 'AH27519670B',
        'AH27519668B', 'AH27519666B', 'AH27519663B', 'AH27519661B', 'AH27519658B',
        'AH27519655B', 'AH27519653B', 'AH27519650B', 'AH27519646B', 'AH27519643B',
        'AH27519640B', 'AH27519632B', 'AH27519628B', 'AH27519625B', 'AH27519622B',
        'AH27519618B', 'AH27519615B', 'AH27519609B', 'AH27519605B', 'AH27519602B',
        'AH26519700B', 'AH26519698B', 'AH26519695B', 'AH26519693B', 'AH26519691B',
        'AH26519689B', 'AH26519687B', 'AH26519685B', 'AH26519683B', 'AH26519681B',
        'AH28519617B', 'AH28519615B', 'AH28519612B', 'AH28519610B', 'AH28519608B',
        'AH28519606B', 'AH28519604B', 'AH28519602B', 'AH27519699B', 'AH27519696B',
        'AH27519694B', 'AH27519692B', 'AH27519690B', 'AH27519688B', 'AH27519686B',
        'AH27519681B', 'AH27519676B', 'AH27519674B', 'AH27519671B', 'AH27519669B',
        'AH27519667B', 'AH27519664B', 'AH27519662B', 'AH27519659B', 'AH27519656B',
        'AH27519654B', 'AH27519652B', 'AH27519647B', 'AH27519644B', 'AH27519641B',
        'AH27519638B', 'AH27519631B', 'AH27519626B', 'AH27519623B', 'AH27519620B',
        'AH27519617B', 'AH27519612B', 'AH27519606B', 'AH27519604B', 'AH27519601B',
        'AH26519699B', 'AH26519696B', 'AH26519694B', 'AH26519692B', 'AH26519690B',
        'AH26519688B', 'AH26519686B', 'AH26519684B', 'AH26519682B', 'AH27519634B'
    ];

    // Initialize page
    init();

    function init() {
        setupEventListeners();
        setupInputValidation();
        checkOCRSupport();
    }

    // LocalStorage functions for tracking checked serials
    function getCheckedSerials() {
        try {
            const stored = localStorage.getItem('kfm_checked_serials');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Error reading localStorage:', e);
            return [];
        }
    }

    function addCheckedSerial(serialNumber) {
        try {
            const checkedSerials = getCheckedSerials();
            if (!checkedSerials.includes(serialNumber)) {
                checkedSerials.push(serialNumber);
                // Keep only last 100 entries to avoid localStorage bloat
                if (checkedSerials.length > 100) {
                    checkedSerials.shift();
                }
                localStorage.setItem('kfm_checked_serials', JSON.stringify(checkedSerials));
            }
        } catch (e) {
            console.warn('Error writing to localStorage:', e);
        }
    }

    function hasCheckedSerial(serialNumber) {
        const checkedSerials = getCheckedSerials();
        return checkedSerials.includes(serialNumber);
    }

    // Client fingerprint functions
    function generateUUID() {
        // Simple UUID v4 generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getClientFingerprint() {
        try {
            let fingerprint = localStorage.getItem('kfm_client_fingerprint');
            if (!fingerprint) {
                fingerprint = generateUUID();
                localStorage.setItem('kfm_client_fingerprint', fingerprint);
            }
            return fingerprint;
        } catch (e) {
            console.warn('Error with client fingerprint:', e);
            // Fallback to session-based UUID if localStorage fails
            if (!window.kfm_session_fingerprint) {
                window.kfm_session_fingerprint = generateUUID();
            }
            return window.kfm_session_fingerprint;
        }
    }

    function setupEventListeners() {
        // Serial form submission
        $('#serialForm').on('submit', function(e) {
            e.preventDefault();
            processSerialNumber();
        });

        // Real-time input formatting
        $('#serialInput').on('input', function() {
            formatSerialInput(this);
        });

        // Camera functionality
        $('#cameraBtn').on('click', function() {
            $('#imageInput').click();
        });

        $('#imageInput').on('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                displayImagePreview(e.target.files[0]);
                // Automatically process the image after preview
                setTimeout(() => {
                    processImageOCR();
                }, 500); // Small delay to ensure preview loads
            }
        });

        $('#processImageBtn').on('click', function() {
            processImageOCR();
        });

        // Clear results when typing new number
        $('#serialInput').on('focus', function() {
            clearResults();
        });
    }

    function setupInputValidation() {
        $('#serialInput').on('blur', function() {
            validateSerialFormat($(this).val());
        });
    }

    function formatSerialInput(input) {
        // Convert to uppercase and remove whitespace, then remove invalid characters
        let value = input.value.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');

        // Limit to 11 characters (max format: 2 letters + 8 digits + 1 letter)
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        input.value = value;

        // Real-time validation for valid lengths (9-11 characters)
        if (value.length >= 9 && value.length <= 11) {
            validateSerialFormat(value);
        } else {
            clearValidationStyles();
        }
    }

    function validateSerialFormat(serialNumber) {
        const $input = $('#serialInput');
        const $feedback = $('#serialInput').next('.invalid-feedback');

        // Remove existing feedback
        $feedback.remove();

        // Expected format: 2 letters, 6-8 digits, 1 letter (e.g., RG7675642A or AH28519618B)
        const formatRegex = /^[A-Z]{2}[0-9]{6,8}[A-Z]$/;

        if (serialNumber.length === 0) {
            clearValidationStyles();
            return true;
        }

        if (!formatRegex.test(serialNumber)) {
            $input.removeClass('is-valid').addClass('is-invalid');
            $input.after('<div class="invalid-feedback">Serial number should be in format: 2 letters + 6-8 digits + 1 letter (e.g., RG7675642A or AH28519618B)</div>');
            return false;
        } else {
            $input.removeClass('is-invalid').addClass('is-valid');

            // Check if this serial was previously checked by this user
            if (hasCheckedSerial(serialNumber)) {
                $input.after('<div class="valid-feedback"><i class="fas fa-check-circle me-1"></i>Valid format - Previously checked by you</div>');
            } else {
                $input.after('<div class="valid-feedback"><i class="fas fa-check-circle me-1"></i>Valid format</div>');
            }

            return true;
        }
    }

    function clearValidationStyles() {
        const $input = $('#serialInput');
        $input.removeClass('is-valid is-invalid');
        $input.nextAll('.invalid-feedback, .valid-feedback').remove();
    }

    function processSerialNumber() {
        const serialNumber = $('#serialInput').val().trim().toUpperCase();

        if (!validateSerialFormat(serialNumber)) {
            return;
        }

        if (serialNumber.length !== 11) {
            showError('Please enter a complete 11-character serial number.');
            return;
        }

        // Show loading
        showLoading();

        // Simulate brief loading time for better UX
        setTimeout(() => {
            // Client-side check
            const isWinner = checkWinningNumber(serialNumber);

            // Hide loading
            hideLoading();

            // Display result
            displayResult(serialNumber, isWinner);

            // Store this serial in localStorage as checked by this user
            addCheckedSerial(serialNumber);

            // Log query to server
            logQuery(serialNumber, isWinner);
        }, 800);
    }

    function checkWinningNumber(serialNumber) {
        return winningNumbers.includes(serialNumber);
    }

    function displayResult(serialNumber, isWinner) {
        const $resultSection = $('#resultSection');
        const $resultContent = $('#resultContent');

        if (isWinner) {
            $resultContent.html(`
                <div class="winner-result result-appear">
                    <div class="text-center">
                        <i class="fas fa-trophy fa-4x mb-3 pulse"></i>
                        <h2 class="mb-3">🎉 CONGRATULATIONS! 🎉</h2>
                        <h4 class="mb-3">You Found a Winning Number!</h4>
                        <p class="lead mb-3">Winning Serial Number: <strong>${serialNumber}</strong></p>
                        <div class="alert alert-warning mt-3 mb-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>IMPORTANT:</strong> You must register your find to enter the R100,000 draw!
                        </div>
                        <a href="https://www.primediaplus.com/competitions/win-r100-000-in-the-kfm-mornings-cash-hunt/" 
                           target="_blank" 
                           class="btn btn-primary btn-lg mb-3">
                            <i class="fas fa-external-link-alt me-2"></i>
                            Register Your Win Now
                        </a>
                        <p class="small text-muted">Click the button above to officially register your winning number and enter the draw.</p>
                    </div>
                </div>
            `);

            // Add confetti effect
            createConfetti();

            // Play celebration sound (if available)
            playCelebrationSound();

        } else {
            $resultContent.html(`
                <div class="loser-result result-appear">
                    <div class="text-center">
                        <i class="fas fa-times-circle fa-3x mb-3"></i>
                        <h3 class="mb-3">Not a Winner</h3>
                        <p class="lead mb-3">Serial Number: <strong>${serialNumber}</strong></p>
                        <p class="mb-0">Sorry, this number is not a winning number. Better luck next time!</p>
                        <hr class="my-3 bg-white">
                        <small class="text-light">Keep trying with other R20 notes - there are 90 chances to enter the draw!</small>
                    </div>
                </div>
            `);
        }

        $resultSection.show();

        // Scroll to result
        $resultSection[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = $('<div class="confetti"></div>');
                confetti.css({
                    left: Math.random() * 100 + '%',
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animationDelay: Math.random() * 3 + 's',
                    animationDuration: (Math.random() * 3 + 2) + 's'
                });

                $('body').append(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 100);
        }
    }

    function playCelebrationSound() {
        // Create a simple celebration beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    function logQuery(serialNumber, isWinner) {
        $.ajax({
            url: 'https://api.kfmcashhunt.site/',
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                action: 'log_query',
                serial_number: serialNumber,
                is_winner: isWinner ? 1 : 0,
                client_fingerprint: getClientFingerprint()
            },
            success: function(response) {
                if (response.success) {
                    // Store this serial in localStorage as checked by this user
                    addCheckedSerial(serialNumber);
                    displayQueryHistory(response.data);
                }
            },
            error: function(xhr, status, error) {
                console.log('Failed to log query:', error);
                // Don't show error to user - this is optional functionality
                // API might be temporarily unavailable
            }
        });
    }

    function displayQueryHistory(data) {
        if (!data.previous_queries) {
            return;
        }

        const $historySection = $('#historySection');
        const $historyContent = $('#historyContent');

        const queryInfo = data.previous_queries;
        const firstQueryDate = new Date(queryInfo.first_query_time);
        const formattedFirstDate = firstQueryDate.toLocaleString();

        let historyHtml = `
            <div class="previous-query mb-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Query History:</strong> This serial number was first checked on ${formattedFirstDate}
        `;

        if (queryInfo.query_count > 1) {
            historyHtml += ` and has been queried ${queryInfo.query_count} times total`;
        }

        if (queryInfo.queried_by_same_user) {
            historyHtml += ` <span class="badge bg-info">Previously checked by you</span>`;
        } else {
            historyHtml += ` <span class="badge bg-secondary">Previously checked by others</span>`;
        }

        historyHtml += `</div>`;

        // Show all timestamps if more than one query
        if (queryInfo.query_count > 1 && queryInfo.all_timestamps) {
            historyHtml += `
                <div class="timestamps">
                    <small class="text-muted">
                        <strong>All query times:</strong><br>
            `;

            queryInfo.all_timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                historyHtml += `• ${date.toLocaleString()}<br>`;
            });

            historyHtml += `
                    </small>
                </div>
            `;
        }

        $historyContent.html(historyHtml);

        $historySection.show();
    }

    function showLoading() {
        $('#loadingModal').modal('show');
    }

    function hideLoading() {
        $('#loadingModal').modal('hide');
    }

    function clearResults() {
        $('#resultSection').hide();
        $('#historySection').hide();
    }

    function showError(message) {
        const $resultSection = $('#resultSection');
        const $resultContent = $('#resultContent');

        $resultContent.html(`
            <div class="alert alert-danger result-appear">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
            </div>
        `);

        $resultSection.show();
    }

    // OCR Functionality
    function checkOCRSupport() {
        // Only show OCR on mobile devices to avoid camera permission prompts
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            // Hide entire OCR card on desktop devices
            $('#cameraCard').hide();
            return;
        }

        if (typeof Tesseract === 'undefined') {
            $('#cameraSection').append(`
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    OCR functionality requires internet connection to load.
                </div>
            `);
        }
    }

    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#previewImg').attr('src', e.target.result);
            $('#imagePreview').show();
        };
        reader.readAsDataURL(file);
    }

    function processImageOCR() {
        const file = $('#imageInput')[0].files[0];
        if (!file) {
            showError('Please select an image first.');
            return;
        }

        if (typeof Tesseract === 'undefined') {
            showError('OCR library not available. Please check your internet connection.');
            return;
        }

        // Show progress
        $('#ocrProgress').show();
        const $progressBar = $('.progress-bar');

        Tesseract.recognize(
            file,
            'eng',
            {
                logger: function(m) {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        $progressBar.css('width', progress + '%');
                        $progressBar.text(progress + '%');
                    }
                }
            }
        ).then(function(result) {
            $('#ocrProgress').hide();

            // Extract potential serial numbers from OCR text
            const extractedSerial = extractSerialFromText(result.data.text);

            if (extractedSerial) {
                $('#serialInput').val(extractedSerial);
                validateSerialFormat(extractedSerial);

                // Auto-check if valid
                if (extractedSerial.length === 11) {
                    processSerialNumber();
                }
            } else {
                showError('Could not extract a valid serial number from the image. Try taking a close-up photo of just the serial number in good lighting, avoiding other text on the banknote.');
            }
        }).catch(function(error) {
            $('#ocrProgress').hide();
            console.error('OCR Error:', error);
            showError('Failed to process image. Try taking a close-up photo of just the serial number in good lighting, or enter the serial number manually.');
        });
    }

    function extractSerialFromText(text) {
        // Look for patterns matching R20 serial numbers
        const serialRegex = /[A-Z]{2}[0-9]{8}[A-Z]/g;
        const matches = text.match(serialRegex);

        if (matches && matches.length > 0) {
            // Return the first match that looks like a valid serial
            return matches[0];
        }

        // Try more flexible matching
        const flexibleRegex = /[A-Z]{1,3}[0-9]{6,10}[A-Z]{0,2}/g;
        const flexibleMatches = text.match(flexibleRegex);

        if (flexibleMatches && flexibleMatches.length > 0) {
            // Find the match closest to 11 characters
            let bestMatch = '';
            for (let match of flexibleMatches) {
                if (Math.abs(match.length - 11) < Math.abs(bestMatch.length - 11)) {
                    bestMatch = match;
                }
            }

            if (bestMatch.length >= 9 && bestMatch.length <= 13) {
                return bestMatch.substring(0, 11); // Truncate to 11 chars
            }
        }

        return null;
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add keyboard shortcuts
    $(document).on('keydown', function(e) {
        // Enter key when focused on input
        if (e.key === 'Enter' && $('#serialInput').is(':focus')) {
            e.preventDefault();
            processSerialNumber();
        }

        // Escape key to clear results
        if (e.key === 'Escape') {
            clearResults();
            $('#serialInput').focus();
        }
    });

    // Auto-focus on input when page loads
    setTimeout(() => {
        $('#serialInput').focus();
    }, 500);
});