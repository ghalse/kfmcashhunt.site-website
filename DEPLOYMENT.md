# Kfm Mornings Cash Hunt - Deployment Checklist

## 📋 Pre-Deployment Checklist

### GitHub Repository Setup
- [ ] Create new GitHub repository
- [ ] Upload all files except sensitive data
- [ ] Verify `.gitignore` excludes sensitive files
- [ ] Enable GitHub Pages in repository settings
- [ ] Set Pages source to "GitHub Actions"
- [ ] Configure custom domain: kfmcashhunt.site

### API Deployment (api.kfmcashhunt.site)
- [ ] Upload `api/` directory contents to `https://api.kfmcashhunt.site/`
- [ ] Set environment variable: `KFM_DB_PATH="/var/lib/kfm/r20_competition.db"`
- [ ] Ensure directory permissions allow SQLite database creation
- [ ] Set file permissions: `chmod 644 api/*.php`
- [ ] Test API health: `curl -X POST https://api.kfmcashhunt.site/ -d '{"action":"health_check"}'`

### DNS & SSL
- [ ] Configure DNS: CNAME kfmcashhunt.site → your-username.github.io
- [ ] Configure DNS: A/CNAME api.kfmcashhunt.site → your-api-server
- [ ] Verify SSL certificates are valid for both domains
- [ ] Test HTTPS connectivity to both endpoints

## 🧪 Testing Checklist

### Frontend Testing (GitHub Pages)
- [ ] Visit https://kfmcashhunt.site/
- [ ] Test manual serial number entry with winner: `AH28519618B`
- [ ] Test manual serial number entry with non-winner: `AH99999999B`
- [ ] Test invalid format: `INVALID123`
- [ ] Test OCR functionality (take photo)
- [ ] Verify responsive design on mobile device
- [ ] Check all CDN resources load (Bootstrap, jQuery, etc.)

### Backend Testing (API)
- [ ] Test API health check endpoint
- [ ] Test query logging with valid serial number
- [ ] Test query statistics endpoint
- [ ] Verify SQLite database entries are being created
- [ ] Test rate limiting (make 101+ requests rapidly)
- [ ] Check CORS headers allow GitHub Pages origin
- [ ] Verify error handling for invalid requests

### Cross-System Integration
- [ ] Test full user journey: kfmcashhunt.site → api.kfmcashhunt.site → SQLite
- [ ] Verify query history shows previous searches
- [ ] Test with multiple IP addresses
- [ ] Check browser console for any JavaScript errors
- [ ] Verify no mixed content warnings (HTTP/HTTPS)

## 📊 Monitoring Setup

### GitHub Pages
- [ ] Monitor GitHub Actions for successful deployments
- [ ] Set up repository notifications for failed builds
- [ ] Track usage via GitHub insights

### api.kfmcashhunt.site API
- [ ] Monitor server logs for API errors
- [ ] Set up SQLite database monitoring for query volume
- [ ] Configure rate limiting alerts
- [ ] Monitor SSL certificate expiration

## 🔧 Post-Deployment

### Documentation
- [ ] Update README with live URLs
- [ ] Document any environment-specific configurations
- [ ] Create user guide if needed

### Performance
- [ ] Test loading speeds from different locations
- [ ] Verify CDN performance
- [ ] Check mobile performance scores

### Security
- [ ] Verify no sensitive data exposed in frontend
- [ ] Test API security headers
- [ ] Confirm rate limiting is working
- [ ] Check for any XSS/injection vulnerabilities

## 🚀 Go-Live Checklist

- [ ] All tests passing ✅
- [ ] Frontend accessible via https://kfmcashhunt.site/
- [ ] API responding correctly from api.kfmcashhunt.site
- [ ] SQLite database logging working
- [ ] Error handling working properly
- [ ] Mobile responsiveness confirmed
- [ ] OCR functionality tested
- [ ] Performance acceptable
- [ ] Security measures in place

## 📞 Support Information

**Frontend Issues:**
- GitHub Pages Status: https://www.githubstatus.com/
- Repository Actions Tab: Check for deployment failures
- Browser Dev Tools: Check console for errors

**Backend Issues:**
- api.kfmcashhunt.site server logs
- SQLite database connection testing
- API endpoint direct testing with curl/Postman

**Common Issues:**
- CORS errors: Check API headers and GitHub Pages origin
- API timeouts: Verify api.kfmcashhunt.site server response times
- Database connection: Check KFM_DB_PATH environment variable and SQLite permissions
- OCR not working: Verify Tesseract.js CDN accessibility

---

**🎯 Ready to launch your Kfm Mornings Cash Hunt!**