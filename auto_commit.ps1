$commits = @(
    @{ File = "src/components/layout/Navbar.jsx"; Msg = "Update Navbar styling for dark theme integration" },
    @{ File = "src/components/home/CategoryGrid.jsx"; Msg = "Enhance CategoryGrid gradients to match purple theme" },
    @{ File = "src/components/home/HeroSlider.jsx"; Msg = "Refactor HeroSlider colors and button hover states" },
    @{ File = "src/pages/Home.jsx"; Msg = "Update Home page CTA and section backgrounds" },
    @{ File = "src/pages/Login.jsx"; Msg = "Style Login page authentication forms and toggle" },
    @{ File = "src/pages/AdminDashboard.jsx"; Msg = "Apply dark theme colors to AdminDashboard stats" },
    @{ File = "src/components/product/ProductCard.jsx"; Msg = "Update ProductCard hover effects and border colors" },
    @{ File = "src/index.css"; Msg = "Define core color variables for Professional Purple theme" },
    @{ File = "src/data/mockData.js"; Msg = "Refine mock data structure for categorization" },
    @{ File = "postcss.config.js"; Msg = "Configure PostCSS for Tailwind CSS v4 compatibility" }
)

$currentCount = (git rev-list --count HEAD)
Write-Host "Current commits: $currentCount"

$targetInput = Read-Host "Enter the target number of commits (default is 15)"
if ([string]::IsNullOrWhiteSpace($targetInput)) {
    $target = 15
} else {
    $target = [int]$targetInput
}

Write-Host "Target set to: $target"
$needed = $target - $currentCount

if ($needed -le 0) {
    Write-Host "Target already reached or exceeded."
    exit
}

foreach ($commit in $commits) {
    $currentCount = (git rev-list --count HEAD)
    if ($currentCount -ge $target) { break }

    if (Test-Path $commit.File) {
        # Check if file has changes to commit
        $status = git status --porcelain $commit.File
        if ($status) {
            git add $commit.File
            git commit -m $commit.Msg
            $currentCount = (git rev-list --count HEAD)
            Write-Host "Committed $($commit.File). Total: $currentCount"
        }
    }
}

# Fill remaining if needed
$currentCount = (git rev-list --count HEAD)
while ($currentCount -lt $target) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path "README.md" -Value "<!-- Updated at $date -->"
    git add README.md
    git commit -m "Update documentation timestamp"
    $currentCount = (git rev-list --count HEAD)
    Write-Host "Added filler commit. Total: $currentCount"
}

Write-Host "Done! Total commits: $currentCount"
