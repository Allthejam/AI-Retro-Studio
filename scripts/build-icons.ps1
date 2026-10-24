param(
    [string]$SourcePath = "public/brand-master.png"
)

Add-Type -AssemblyName System.Drawing

if (!(Test-Path $SourcePath)) {
    Write-Error "Source image not found at $SourcePath"
    exit 1
}

$src = [System.Drawing.Image]::FromFile($SourcePath)

function Resize-And-Save($source, $width, $height, $targetPath, $padding = 0) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($padding -gt 0) {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
        $graphics.FillRectangle($brush, 0, 0, $width, $height)
        $brush.Dispose()
        $destW = $width - ($padding * 2)
        $destH = $height - ($padding * 2)
        $graphics.DrawImage($source, $padding, $padding, $destW, $destH)
    } else {
        $graphics.DrawImage($source, 0, 0, $width, $height)
    }

    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
}

# Ensure directories
New-Item -ItemType Directory -Force -Path 'public/icons' | Out-Null

Write-Host "Generating PWA icons..."
Resize-And-Save $src 192 192 'public/icons/icon-192x192.png' 0
Resize-And-Save $src 512 512 'public/icons/icon-512x512.png' 0
Resize-And-Save $src 192 192 'public/icons/icon-maskable-192x192.png' 20
Resize-And-Save $src 512 512 'public/icons/icon-maskable-512x512.png' 54
Resize-And-Save $src 180 180 'public/icons/apple-touch-icon.png' 0

# Copy root convenience files
Copy-Item 'public/icons/apple-touch-icon.png' 'public/apple-touch-icon.png' -Force
Copy-Item 'public/icons/icon-192x192.png' 'public/icon.png' -Force

# Generate 32x32 and 16x16 for favicon
$bmp32 = New-Object System.Drawing.Bitmap 32, 32
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.DrawImage($src, 0, 0, 32, 32)

$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fs = [System.IO.File]::Create("public/favicon.ico")
$icon.Save($fs)
$fs.Close()

$fs2 = [System.IO.File]::Create("src/app/favicon.ico")
$icon.Save($fs2)
$fs2.Close()

$icon.Dispose()
$g32.Dispose()
$bmp32.Dispose()
$src.Dispose()

Write-Host "Icons generated successfully!"
