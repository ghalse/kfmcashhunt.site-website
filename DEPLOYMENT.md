# R20 Competition - Deployment Checklist

## 📋 Pre-Deployment Checklist

### GitHub Repository Setup
- [ ] Create new GitHub repository
- [ ] Upload all files except `api/config.php`
- [ ] Verify `.gitignore` excludes sensitive files
- [ ] Enable GitHub Pages in repository settings
- [ ] Set Pages source to "GitHub Actions"

### API Deployment (mombe.org)
- [ ] Upload `api/` directory contents to `https://mombe.org/kfm/api/`
- [ ] Copy `api/config.sample.php` to `api/config.php`
- [ ] Update database credentials in `api/config.php` and `api/index.php`
- [ ] Run database setup: `mysql -u user -p < api/database_setup.sql`
- [ ] Set file permissions: `chmod 644 api/*.php`
- [ ] Test API health: `curl -X POST https://mombe.org/kfm/api/ -d '{"action":"health_check"}'`

### DNS & SSL (if needed)
- [ ] Verify mombe.org SSL certificate is valid
- [ ] Test HTTPS connectivity to API endpoint
- [ ] Configure any necessary firewall rules

## 🧪 Testing Checklist

### Frontend Testing (GitHub Pages)
- [ ] Visit GitHub Pages URL
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
- [ ] Verify database entries are being created
- [ ] Test rate limiting (make 101+ requests rapidly)
- [ ] Check CORS headers allow GitHub Pages origin
- [ ] Verify error handling for invalid requests

### Cross-System Integration
- [ ] Test full user journey: GitHub Pages → mombe.org API → database
- [ ] Verify query history shows previous searches
- [ ] Test with multiple IP addresses
- [ ] Check browser console for any JavaScript errors
- [ ] Verify no mixed content warnings (HTTP/HTTPS)

## 📊 Monitoring Setup

### GitHub Pages
- [ ] Monitor GitHub Actions for successful deployments
- [ ] Set up repository notifications for failed builds
- [ ] Track usage via GitHub insights

### mombe.org API
- [ ] Monitor server logs for API errors
- [ ] Set up database monitoring for query volume
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
- [ ] Frontend accessible via GitHub Pages
- [ ] API responding correctly from mombe.org
- [ ] Database logging working
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
- mombe.org server logs
- Database connection testing
- API endpoint direct testing with curl/Postman

**Common Issues:**
- CORS errors: Check API headers and GitHub Pages origin
- API timeouts: Verify mombe.org server response times
- Database connection: Check credentials and MySQL service status
- OCR not working: Verify Tesseract.js CDN accessibility

---

**🎯 Ready to launch your R20 competition!**