---
layout: post
title: "Complete Guide to GitKraken GitHub Organization Repository Integration"
date: 2023-08-10 14:30:00 +0900
categories: [Tips, Development]
tags: [gitkraken, github, organization, repository, oauth, git-tools]
author: "Kevin Park"
excerpt: "How to solve the issue of organization private repositories not showing in GitKraken through OAuth permission settings"
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/08/10/gitkraken-github-organization-repository-en/
---

# Complete Guide to GitKraken GitHub Organization Repository Integration

## 🎯 Summary

### Core Solution
**Problem**: GitHub organization repositories not visible in GitKraken
**Solution**: Grant organization access through OAuth app permission settings

### Quick Fix
```
1. GitHub login → Click profile icon (top right)
2. Settings → Applications menu
3. Authorized OAuth Apps → Select GitKraken
4. Organization access → Click Grant button
5. Restart GitKraken → Check repository list
```

### Most Common Use Cases
- **Personal + Organization account mix**: Managing code by project organizations
- **Microservice architecture**: Separate repository management per service
- **Team projects**: Using organization accounts by company/project

---

## 📚 Detailed Explanation

### Background and Necessity

With GitHub's free policy changes allowing free private repositories for organization accounts, many developers now create organization accounts for projects or companies to manage source code.

Particularly in microservice architecture, separating repositories by service is highly beneficial for development efficiency, unit testing, and collaborative work.

### Problem Situation

When using Git GUI tools like GitKraken or SourceTree, personal repositories appear normally, but organization account repositories don't show up in the list.

This occurs because **OAuth app organization access permissions are restricted by default**.

### Step-by-Step Solution

#### Step 1: Access GitHub Settings Page
```
GitHub.com login → Profile icon (top right) → Settings
```

#### Step 2: Navigate to Applications Menu
```
Left sidebar: Applications → Authorized OAuth Apps
```

#### Step 3: Select GitKraken App and Configure Permissions
```
Select GitKraken from OAuth Apps list
→ Check Organization access section
→ Click Grant button for desired organization
```

#### Step 4: Approve Permissions and Verify
- Clicking Grant button provides access to that organization's repositories
- Restart GitKraken to apply changes
- Check if organization repositories appear in the Clone menu

### Real-World Use Cases

#### Project-based Organization Management
```markdown
Personal account: kevin-park
Organization accounts:
- company-a-projects (Company A projects)
- gnuboard-skins (Gnuboard skin collection)
- microservice-platform (Microservice platform)
```

#### Team Collaboration Scenarios
1. **Organization Creation**: Create GitHub organization accounts by project or company
2. **Repository Separation**: Separate repositories by function or service
3. **Permission Management**: Granular access control per team member
4. **Tool Integration**: OAuth permission setup in GUI tools like GitKraken

### Precautions and Tips

#### Permission Management Best Practices
- **Principle of least privilege**: Grant permissions only to necessary organizations
- **Regular permission review**: Clean up unnecessary OAuth app permissions
- **Team education**: Share setup methods with new team members

#### Troubleshooting
```markdown
Issue: Grant button is disabled
Solution: Ask organization admin to check OAuth app policy

Issue: Repositories still not visible after permission setup
Solution: Completely restart GitKraken or reconnect account
```

## Conclusion

Integration between GitHub organization accounts and GitKraken can be easily resolved through OAuth app permission settings. Following the sequence: Personal settings → `Applications → Authorized OAuth Apps → GitKraken → Grant` allows access to all organization repositories.

Organization-based code management in microservice architecture or team projects can significantly improve development efficiency, so mastering these setup methods will make your development workflow much smoother.

### Next Steps Suggestions
- Learn organization account security policy setup methods
- Utilize GitKraken's advanced branch management features
- Build CI/CD pipelines through GitHub Actions