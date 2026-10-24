Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path 'public/icons' | Out-Null
$src = [System.Drawing.Image]::FromFile('.idx/icon.png')

function Resize-Image($source, $width, $height, $targetPath, $padding = 0) {
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

Resize-Image $src 192 192 'public/icons/icon-192x192.png' 0
Resize-Image $src 512 512 'public/icons/icon-512x512.png' 0
Resize-Image $src 192 192 'public/icons/icon-maskable-192x192.png' 24
Resize-Image $src 512 512 'public/icons/icon-maskable-512x512.png' 64
Resize-Image $src 180 180 'public/icons/apple-touch-icon.png' 16

$src.Dispose()
Get-ChildItem public/icons
