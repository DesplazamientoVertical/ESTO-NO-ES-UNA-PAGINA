# ESTO NO ES UNA PAGINA

Una página personal oscura, satánica y Y2K: letras clásicas, negro, rojo, piedra y marcos cromados. Conserva las fotos, los textos de Gino, la ventana de Lucas, los agradecimientos, el altar de Brandon y el templo. Suma el GIF aportado por Gino y el Modo Impalero.

## Subir a GitHub Pages

1. Descomprimí el ZIP.
2. Creá un repositorio en GitHub. Si usás GitHub Free, hacelo público.
3. Subí **el contenido** de esta carpeta a la raíz del repositorio. `index.html` tiene que quedar visible al abrir el repo, junto con los CSS, los scripts y la carpeta `assets`. No subas el ZIP sin descomprimir.
4. Entrá en **Settings → Pages**.
5. En **Build and deployment → Source**, elegí **Deploy from a branch**.
6. Elegí la rama **main** (o la que hayas usado), carpeta **/(root)** y **Save**.
7. Cuando GitHub termine de publicar, en esa misma pantalla aparece el enlace de tu página.

No hace falta instalar nada, correr npm ni configurar claves. Las rutas son relativas: funciona también en `usuario.github.io/nombre-del-repo/`. El archivo `.nojekyll` evita procesamiento innecesario; puede aparecer oculto en algunas aplicaciones.

[Guía oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Verla antes de subir

Abrí `index.html` con tu navegador. Los recursos visuales y el audio están guardados localmente. Los enlaces del disco, de otros sitios y de créditos llevan a páginas externas.

## Modo Impalero

Tocá **Modo Impalero** para reproducir *Feels Like We Only Go Backwards*, de Tame Impala. El audio empieza con ese click. Mientras suena, los colores, fondos y formas de la página se transforman gradualmente durante unos **60 segundos**.

El mismo botón pasa a decir **nana me re bajo del barco**: tocándolo se detiene el tema, vuelve al principio y se recupera el aspecto oscuro de la página. El tema se repite mientras el modo permanece activo. El modo también se detiene al salir de la página.

El botón queda al final de la columna derecha y el GIF, derecho, al final de la izquierda. Forman parte del contenido y se desplazan con la página; en celulares las columnas se apilan. La preferencia de movimiento reducido del sistema mantiene quietos los GIFs y limita los movimientos del efecto.

## Contenido y archivos

Los textos estáticos están en `index.html`, dentro de los elementos `site-copy`. La presentación y las fotos están en `id="quien-soy"`; la galería, en `id="galeria-del-caos"`; los agradecimientos, en `id="agradecimientos"`; y el altar, en `id="altar-brandon"`. Los mensajes personalizados de la ventana de Lucas se conservan en el JSON `site-texts` de `index.html`.

- `style.css`: aspecto oscuro, texturas, distribución y diseño para celular.
- `script.js`: ventana de Lucas, créditos, visitas, preferencia de movimiento reducido y sangre del cursor.
- `impalero.js` y `impalero.css`: reproducción del tema y transformación gradual del Modo Impalero.
- `templo.html`, `templo.css` y `templo.js`: página del templo y su movimiento según la preferencia del sistema.
- `assets/anti-nazi.gif`: GIF aportado por Gino, junto al borde de la página.
- `assets/feels-like-we-only-go-backwards.mp3`: audio local del Modo Impalero.
- `assets/`: fotos, GIFs, fotogramas quietos, texturas y fuentes de respaldo con sus licencias.

Conservá todos los recursos junto a los HTML al publicar o mover la página.

## Qué hace

- **TOCAR SI SOS LUCAS** abre el GIF de *Secreto en la montaña*, el mensaje personalizado que empieza con **T AMO LUCAS** y el botón **ESAAAA**.
- Los GIFs históricos de calaveras, sangre, murciélago y velas acompañan las fotos, los stickers y la galería.
- **ENTRAR AL TEMPLO** abre la página con Baphomets, pentagramas y sangre decorativa.
- La recomendación de Pink Floyd incluye su portada y un enlace oficial para elegir dónde escuchar el disco.
- Un rastro de gotas rojas sigue al mouse. Se detiene mientras hay una ventana abierta o está activa la preferencia de movimiento reducido.
- **Modo Impalero** reproduce el audio y transforma progresivamente el diseño.

Las visitas se guardan **solo en el navegador de cada visitante**, si permite almacenamiento. No representan visitas globales. No hay backend, comentarios públicos, formularios ni analítica. Si el navegador bloquea el almacenamiento, el sitio sigue funcionando durante la sesión.

Los textos usan Times New Roman / Times; los controles, Tahoma / Arial; y las etiquetas, Courier New. Son fuentes clásicas del sistema. No se redistribuye ninguna fuente de Microsoft. Las fuentes de respaldo de versiones anteriores conservan sus licencias.

## Créditos

Inspiración: [Cameron's World](https://www.cameronsworld.net/), [Space Jam de 1996](https://www.spacejam.com/1996/) y [Superbad](https://superbad.com/).

El tema oscuro toma referencias de [The Dark Realm of Bad Humor](https://web.archive.org/web/20091024022720/http://geocities.com/kirkhammet2000/jimsdomainindex.html), [Team Evil Dead](https://web.archive.org/web/20091026131217/http://geocities.com/teamevildead/framesource.html) y [Ophelia Dark](https://web.archive.org/web/20090727154523/http://es.geocities.com/opheliadark/ophelia106.html). Los GIFs históricos se recuperaron de [GifCities / Internet Archive](https://gifcities.org/).

Las texturas proceden de [Graphics by Jo](https://www.oocities.org/graphics_by_jo/) y [The Horror GIF Necronomicon](https://horrorgifs.neocities.org/bg).

Ver `CREDITOS.md`, `assets/FONT-LICENSE.txt` y `assets/PIRATA-FONT-LICENSE.txt` para las atribuciones. Conservá esos archivos y el botón de créditos al publicar.
