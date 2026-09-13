<?php
/**
 * Qaway Lab - Despachador Dinamico Open Graph en Tiempo Real para Redes Sociales
 * Intercepta peticiones de bots (Facebook, WhatsApp, LinkedIn, Twitter/X)
 * y consulta a Supabase en tiempo real para servir las etiquetas de portada y titulo.
 */

header('Content-Type: text/html; charset=UTF-8');

$rawSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawSlug);

$defaultTitle = "Qaway Lab | Marcas, sistemas digitales y formacion con IA";
$defaultDesc = "Plataforma de aceleracion digital y formacion practica en IA para negocios y profesionales.";
$defaultImage = "https://www.qawaylab.com/favicon.png";
$siteUrl = "https://www.qawaylab.com";
$articleUrl = $slug ? "{$siteUrl}/blog/articulo/{$slug}" : $siteUrl;

$title = $defaultTitle;
$desc = $defaultDesc;
$image = $defaultImage;
$publishedTime = date('c');

if (!empty($slug)) {
    $supabaseUrl = "https://qrusdsqgygfolxfrafyd.supabase.co";
    $supabaseKey = "sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi";

    $endpoint = "{$supabaseUrl}/rest/v1/posts?or=(slug.eq.{$slug},id.eq.{$slug})&select=title,excerpt,cover_url,created_at,published_at&limit=1";

    $opts = [
        "http" => [
            "method" => "GET",
            "header" => [
                "apikey: {$supabaseKey}",
                "Authorization: Bearer {$supabaseKey}",
                "Accept: application/json"
            ],
            "timeout" => 3
        ]
    ];

    $context = stream_context_create($opts);
    $response = @file_get_contents($endpoint, false, $context);

    if ($response === false && function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$supabaseKey}",
            "Authorization: Bearer {$supabaseKey}",
            "Accept: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
    }

    if ($response) {
        $data = json_decode($response, true);
        if (!empty($data) && is_array($data) && isset($data[0])) {
            $post = $data[0];
            if (!empty($post['title'])) {
                $title = strip_tags($post['title']);
            }
            if (!empty($post['excerpt'])) {
                $desc = mb_substr(strip_tags($post['excerpt']), 0, 180, 'UTF-8');
            }
            if (!empty($post['published_at'])) {
                $publishedTime = $post['published_at'];
            } elseif (!empty($post['created_at'])) {
                $publishedTime = $post['created_at'];
            }

            if (!empty($post['cover_url'])) {
                $rawCover = $post['cover_url'];
                if (strpos($rawCover, 'data:image/') === 0) {
                    $cachedFile = __DIR__ . "/assets/blog-covers/{$slug}.webp";
                    if (file_exists($cachedFile)) {
                        $image = "{$siteUrl}/assets/blog-covers/{$slug}.webp";
                    } else {
                        if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $rawCover, $matches)) {
                            $ext = $matches[1] === 'jpeg' ? 'jpg' : ($matches[1] === 'octet-stream' ? 'webp' : $matches[1]);
                            $coversDir = __DIR__ . "/assets/blog-covers";
                            if (!is_dir($coversDir)) {
                                @mkdir($coversDir, 0755, true);
                            }
                            $filePath = "{$coversDir}/{$slug}.{$ext}";
                            @file_put_contents($filePath, base64_decode($matches[2]));
                            if (file_exists($filePath)) {
                                $image = "{$siteUrl}/assets/blog-covers/{$slug}.{$ext}";
                            }
                        }
                    }
                } elseif (strpos($rawCover, 'http://') === 0 || strpos($rawCover, 'https://') === 0) {
                    $image = $rawCover;
                } else {
                    $image = $siteUrl . '/' . ltrim($rawCover, '/');
                }
            }
        }
    }
}

$safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($desc, ENT_QUOTES, 'UTF-8');
$safeImage = htmlspecialchars($image, ENT_QUOTES, 'UTF-8');
$safeUrl = htmlspecialchars($articleUrl, ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo $safeTitle; ?> | Blog Qaway Lab</title>
    <meta name="description" content="<?php echo $safeDesc; ?>" />

    <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Qaway Lab" />
    <meta property="og:url" content="<?php echo $safeUrl; ?>" />
    <meta property="og:title" content="<?php echo $safeTitle; ?>" />
    <meta property="og:description" content="<?php echo $safeDesc; ?>" />
    <meta property="og:image" content="<?php echo $safeImage; ?>" />
    <meta property="og:image:secure_url" content="<?php echo $safeImage; ?>" />
    <meta property="og:image:alt" content="<?php echo $safeTitle; ?>" />
    <meta property="article:published_time" content="<?php echo htmlspecialchars($publishedTime, ENT_QUOTES, 'UTF-8'); ?>" />
    <meta property="article:author" content="Qaway Lab" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="<?php echo $safeUrl; ?>" />
    <meta name="twitter:title" content="<?php echo $safeTitle; ?>" />
    <meta name="twitter:description" content="<?php echo $safeDesc; ?>" />
    <meta name="twitter:image" content="<?php echo $safeImage; ?>" />
    <link rel="canonical" href="<?php echo $safeUrl; ?>" />

    <!-- Redireccion automatica transparente para humanos -->
    <meta http-equiv="refresh" content="0; url=<?php echo $safeUrl; ?>">
    <script>
        window.location.replace(<?php echo json_encode($articleUrl); ?>);
    </script>
</head>
<body style="font-family: system-ui, sans-serif; padding: 2rem; background: #f8fafc; color: #0f172a;">
    <p>Redirigiendo al articulo: <strong><a href="<?php echo $safeUrl; ?>"><?php echo $safeTitle; ?></a></strong>...</p>
</body>
</html>
