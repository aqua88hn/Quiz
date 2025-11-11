# QuizMate - Deployment & Testing Guide

## Local Development Setup

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from example
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage - List of quizzes |
| `/quiz/[id]` | Take a quiz |
| `/quiz/[id]/result` | Quiz results page |
| `/quiz/[id]/review` | Review answers & explanations |
| `/admin/login` | Admin login page |
| `/admin` | Admin dashboard |
| `/api/v1/quizzes` | API: Get all quizzes |
| `/api/health` | API: Health check |

---

## Testing Locally

### Manual Testing Checklist

- [ ] **Homepage**: Loads and displays 2 quizzes
- [ ] **Start Quiz**: Click quiz → quiz page loads
- [ ] **Answer Questions**: 
  - [ ] Click option → selected with green border
  - [ ] Single-select: Only one answer allowed
  - [ ] Multi-select: Multiple answers allowed
- [ ] **Navigation**: 
  - [ ] Next button moves to next question
  - [ ] Previous button works
  - [ ] Last question shows "Submit" button
- [ ] **Results**: 
  - [ ] Displays score percentage
  - [ ] Shows correct count
  - [ ] Shows congratulations message
- [ ] **Review**:
  - [ ] All questions visible
  - [ ] Shows your answers
  - [ ] Shows correct answers
  - [ ] Shows explanations
  - [ ] Correct answers highlighted green
  - [ ] Incorrect answers highlighted red
- [ ] **Admin**:
  - [ ] Go to `/admin/login`
  - [ ] Enter password: `admin123`
  - [ ] Should see admin dashboard

### Automated Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Production Deployment

### Deploy to Vercel (Recommended)

#### Method 1: GitHub Integration (Easiest)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Initial QuizMate commit"
git push origin main
```

**Step 2: Create Vercel Project**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js

**Step 3: Add Environment Variables**
1. In Vercel dashboard, go to Settings → Environment Variables
2. Add these variables:
   - Key: `JWT_SECRET` | Value: `your-super-secret-key-12345`
   - Key: `ADMIN_PASSWORD` | Value: `admin123`
3. Click "Save"

**Step 4: Deploy**
- Click "Deploy" button
- Wait 2-3 minutes for build to complete
- Your app is now live! 🎉

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel account
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to link your project
```

---

## Post-Deployment Testing

After your app is deployed, test these:

### 1. Test Public Features

```bash
# Replace YOUR_URL with your Vercel URL

# Health check
curl https://YOUR_URL.vercel.app/api/health

# Get quizzes
curl https://YOUR_URL.vercel.app/api/v1/quizzes

# Get specific quiz
curl https://YOUR_URL.vercel.app/api/v1/quizzes/python_keywords_expert
```

### 2. Test in Browser

- [ ] Homepage loads
- [ ] Take a quiz end-to-end
- [ ] Submit and see results
- [ ] Review answers page works
- [ ] Admin login page loads at `/admin/login`
- [ ] Try admin password: `admin123`

### 3. Performance Check

- [ ] Page loads in < 2 seconds
- [ ] Clicking quiz is instant
- [ ] No console errors
- [ ] Responsive on mobile

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-12345` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` |

**Security Note**: Never commit `.env.local` to Git. It's automatically ignored.

---

## Troubleshooting

### Issue: "Build failed on Vercel"
**Solution**: 
- Check Vercel build logs for error details
- Make sure all dependencies are in `package.json`
- Try `npm install && npm run build` locally first

### Issue: "Environment variables not working"
**Solution**:
- Double-check variable names match exactly
- Redeploy after adding variables (Vercel caches builds)
- Check `.env.local` exists locally

### Issue: "Cannot find module"
**Solution**: 
- Run `npm install`
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

### Issue: "Admin login not working"
**Solution**:
- Check password in `.env.local`: `ADMIN_PASSWORD=admin123`
- Clear browser cache/cookies
- Check browser console for errors

---

## Next Steps

1. **Test everything locally** first
2. **Push to GitHub** 
3. **Deploy to Vercel**
4. **Test on production** URL
5. **Share your URL** with others!

---

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review Vercel deployment logs
3. Check browser console for errors
4. Try running locally to isolate the issue

---

## Your Deployment Checklist

- [ ] Local testing passed all tests
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Build succeeded
- [ ] Production testing passed
- [ ] App is live and working!

Congratulations! Your QuizMate app is ready for the world! 🚀
