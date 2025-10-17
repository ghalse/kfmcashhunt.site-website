# R20 Competition Website

A responsive web application for checking R20 banknote serial numbers in a radio station competition.

## 🚀 Live Demo

- **Frontend (GitHub Pages)**: Your GitHub Pages URL will be here after deployment
- **API (api.kfmcashhunt.site)**: https://api.kfmcashhunt.site/

## 🎯 Features

- **Client-side validation**: Instant checking of serial numbers against 90 winning numbers
- **Responsive design**: Works perfectly on desktop and mobile devices
- **OCR functionality**: Take photos of banknotes to extract serial numbers automatically
- **Query logging**: Track which numbers have been checked and when via API
- **AJAX communication**: Seamless interaction without page reloads
- **GitHub Pages hosting**: Static frontend with separate PHP API

## 📁 Project Structure

```
├── index.html              # Main application (GitHub Pages)
├── style.css              # Custom styling and responsive design
├── app.js                 # Client-side logic and API communication
├── test.html              # Testing and debugging page
├── api/                   # Backend API (deploy to mombe.org)
│   ├── index.php          # Main API endpoint
│   ├── database_setup.sql # MySQL schema
│   ├── config.sample.php  # Configuration template
│   └── README.md          # API-specific documentation
├── .github/workflows/     # GitHub Actions
│   └── pages.yml          # Auto-deployment to GitHub Pages
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (jQuery) - *Hosted on GitHub Pages*
- **Backend**: PHP 8+ with SQLite3 - *Hosted on api.kfmcashhunt.site*
- **Libraries**:
  - Bootstrap 5.3.2 (responsive design)
  - jQuery 3.7.1 (DOM manipulation and AJAX)
  - Tesseract.js 4.1.1 (OCR functionality)
  - Font Awesome 6.4.0 (icons)

## 🚀 Deployment Guide

### Part 1: GitHub Pages (Static Frontend)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial R20 competition website"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on push

3. **Access your site**:
   - URL: `https://your-username.github.io/repository-name/`

### Part 2: api.kfmcashhunt.site API Setup

1. **Upload API files**:
   ```bash
   # Upload everything in api/ directory to:
   # https://api.kfmcashhunt.site/
   ```

2. **Database setup on api.kfmcashhunt.site**:
   ```bash
   mysql -u your_user -p < api/database_setup.sql
   ```

3. **Configure API**:
   - Copy `api/config.sample.php` to `api/config.php`
   - Update database credentials in `api/index.php`
   - Set file permissions: `chmod 644 *.php`

## 🧪 Testing

1. **Test locally**: Open `test.html` in browser
2. **Test numbers**:
   - Winner: `AH28519618B` 🏆
   - Non-winner: `AH99999999B` 📝

## 📊 API Integration

The static frontend communicates with the PHP API at `https://api.kfmcashhunt.site/` for:
- Query logging and statistics
- Checking previous searches by IP
- Rate limiting and security features## 📖 Usage

### Manual Entry
1. Visit your GitHub Pages URL
2. Enter an 11-character serial number (format: AH12345678B)
3. Click "Check Number" for instant results
4. Winners get celebration effects! 🎉

### OCR Scanning (Beta)
1. Click "Take Photo" to access device camera
2. Photograph your R20 note clearly
3. Click "Process Image" to auto-extract serial number
4. System validates and checks automatically

## 🔌 API Endpoints (mombe.org)

### POST https://mombe.org/kfm/api/

**Available Actions:**
- `health_check` - Test API status
- `log_query` - Log a serial number query
- `get_stats` - Retrieve query statistics

**Example Request:**
```javascript
fetch('https://mombe.org/kfm/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'log_query',
        serial_number: 'AH28519618B',
        is_winner: 1
    })
});
```

## 🔒 Security Features

- **Client-side validation**: Instant format checking
- **Cross-origin requests**: Proper CORS headers configured
- **Rate limiting**: 100 requests per IP per hour
- **SQL injection protection**: Prepared statements
- **Input sanitization**: All data validated and cleaned
- **IP logging**: Anonymous tracking for analytics

## 🏆 Winning Numbers

90 predefined winning serial numbers embedded in client-side code for instant validation. Server-side API provides query logging and statistics.

## 🌐 Browser Compatibility

- ✅ Chrome 60+, Firefox 55+, Safari 12+, Edge 16+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Progressive Web App features
- ✅ Offline-capable client-side validation

## ⚡ Performance Features

- **CDN libraries**: Fast loading from cdnjs.com
- **Client-side validation**: No server delay for winner checking
- **Optimized images**: Compressed assets for mobile
- **GitHub Pages CDN**: Global content delivery
- **Minimal API calls**: Only for logging, not validation

## 🔧 Troubleshooting

### GitHub Pages Issues
- Check Actions tab for deployment status
- Verify `pages.yml` workflow is enabled
- Ensure repository is public or Pages is enabled for private repos

### API Connection Issues
- Test API health at: https://mombe.org/kfm/api/ (POST `{"action":"health_check"}`)
- Check browser console for CORS errors
- Verify mombe.org is accessible and PHP is working

### OCR Not Working
- Ensure stable internet (Tesseract.js loads from CDN)
- Use good lighting and steady hands for photos
- Try different angles if serial number isn't detected

## 🎨 Customization

### Update Winning Numbers
Edit the `winningNumbers` array in `app.js`:
```javascript
const winningNumbers = [
    'AH28519618B',
    'AH28519616B',
    // Add new winners here...
];
```

### Modify Styling
Edit `style.css` or override Bootstrap classes for custom themes.

### API Configuration
Update `api/config.sample.php` and `api/index.php` for database settings.

## 📞 Support & Contributing

- **Issues**: Use GitHub Issues for bug reports
- **API Logs**: Check mombe.org server logs for backend issues
- **Browser Console**: F12 Developer Tools for frontend debugging
- **Test Page**: Use `test.html` for comprehensive system testing

---

**🍀 Good luck finding those winning R20 notes!**