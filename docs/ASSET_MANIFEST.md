# Recursos originales · Hallow Agenda

Actualizado el 16 de noviembre de 2026. El usuario confirmó autorización para usar la música, los personajes, los escenarios y los efectos originales en el proyecto. Todos los archivos se sirven localmente desde Django; no hay hotlinking ni imágenes generadas por IA.

| Recurso | Fuente | Uso y adaptación |
|---|---|---|
| Bone Bottom, Silksong | [Hollow Knight Wiki](https://hollowknight.wiki/w/File:Screenshot_SS_Bone_Bottom_02.png), Team Cherry | `static/recursos-hollow/escenarios/pharloom.webp`, captura original 1920×1080 optimizada a WebP; fondo público con desplazamiento, zoom lento y reacción al mouse. |
| Ciudad de Lágrimas | [Hollow Knight Wiki](https://hollowknight.wiki/w/File:Screenshot_HK_City_of_Tears_02.png), Team Cherry | `escenarios/hallownest.webp`, captura original 1920×1080 optimizada a WebP; administración. |
| Hornet, 6 fotogramas idle | [CamoLover/Hornet-Desktop-Companion](https://github.com/CamoLover/Hornet-Desktop-Companion/tree/main/assets/sprites/idle), arte del juego de Team Cherry | `personajes/hornet/hornet_idle_1.png` a `_6.png`; animación en portada y marca de navegación. Se copiaron imágenes; no se incorporó código del proyecto GPL. |
| Caballero, Quirrel, Cornifer y Cloth | [Archivo de arte promocional](https://github.com/zheyuanzhou/Hollow-Knight-Resources/tree/master/HK_Character%20Promotional%20Art), Team Cherry | `personajes/knight.png`, `quirrel.webp`, `cornifer.webp`, `cloth.webp`. Arte original: no son ciclos animados extraídos; su reacción al mouse y movimiento suave son transformaciones CSS. Panel, formularios, ficha y páginas API. |
| Cursor del juego | [Cursor.png](https://hollowknight.wiki/w/File:Cursor.png), Team Cherry | `cursor.png`, PNG original 37×37. Hotspot 4,2; cursor nativo como respaldo y cursor de texto en campos. |
| Confirmación de interfaz | Archivo previo del usuario: `static/sounds/ui_button_confirm.mp3` | `audio/confirmar.mp3`, MP3 real de 1,33 s, silencio final retirado y fundido corto. Sustituye el tono sintetizado. Los enlaces internos y formularios normales esperan el fin del sonido; un límite de 1,6 s impide bloquear la navegación si el audio falla. Los controles AJAX conservan su comportamiento. |
| Música existente | Archivo previo `theme.mp3`; atribuido por el usuario a Hollow Knight, Christopher Larkin | `static/sounds/ambiente-hallownest.mp3`, 81,87 s. Se conserva el archivo ya existente y su reproductor. La identificación exacta de la pista no se verificó mediante metadatos. |

Los sprites y el arte pertenecen a sus titulares. Los repositorios comunitarios se documentan como fuente, no como titular de los derechos del juego.

La lluvia se genera con CSS: ahora se desplaza la capa de gotas, en dos velocidades, en vez de desplazar un fondo vertical visualmente idéntico. Las animaciones decorativas se detienen con `prefers-reduced-motion`, efectos reducidos o pestaña oculta. La música puede requerir un primer gesto por la política de reproducción del navegador. Su posición aproximada se conserva entre recargas; las navegaciones completas interrumpen brevemente el ambiente.

La segunda pista es `Needoline` de Silksong, Christopher Larkin, tomada del archivo `assets/audio/needoline.mp3` del repositorio de Hornet indicado arriba. Se sirve como `audio/needoline.mp3` a 128 kbit/s, duración aproximada 302,55 s. El reproductor permite cambiar de pista y avanza al terminar.

Criaturas originales: [Vengefly](https://hollowknight.wiki/w/File:Vengefly_Idle.png) y [Crawlid](https://hollowknight.wiki/w/File:B_Crawlid.png), Team Cherry. Son sprites individuales con desplazamiento y oscilación procedurales; no se presentan como ciclos de fotogramas del juego. Aparecen aleatoriamente, con máximo de dos en pantalla, no capturan clics y se retiran al cruzar. Se detienen al ocultar la pestaña o reducir movimiento.

El favicon muestra la cabeza del Caballero mediante una ventana SVG sobre el PNG promocional original, sin redibujar el personaje. El cliente independiente incluye una copia local de los recursos necesarios bajo `ambient/`.
