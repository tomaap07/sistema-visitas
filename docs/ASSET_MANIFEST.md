# Inventario de recursos · Hallow Agenda 2.0

Revisión: 16 de noviembre de 2026. Las páginas enlazadas son **catálogos de referencia**, no una autorización para redistribuir sus archivos. La aplicación no depende de esos sitios para funcionar.

## Recursos actualmente utilizados

| Recurso | Origen / autor | Archivo y formato | Resolución / duración | Autorización y uso |
|---|---|---|---|---|
| Música ambiental existente, «Enter Hallownest» según identificación del usuario | Hollow Knight; música de Christopher Larkin, [álbum oficial](https://christopherlarkin.bandcamp.com/album/hollow-knight-original-soundtrack) | `static/sounds/ambiente-hallownest.mp3` (MP3); fuente previa `static/sounds/theme.mp3` | 81,87 s; audio | El usuario confirmó el 16-11-2026 que tiene autorización para usar **el archivo existente** en la web. La grabación fue convertida a MP3 real; la identificación exacta de la pista no se verificó mediante metadatos. Reproductor global. |
| Cuevas, niebla, lluvia, gotas, luces y ornamentos | Implementación propia del proyecto | CSS y JavaScript: `static/css/ambiente-v2.css`, `static/js/escenario.js` | Vectorial / responsivo | Código del proyecto; no son imágenes ni sprites originales del juego. Escenario decorativo. |
| Efectos de interacción y lluvia sonora | Síntesis propia mediante Web Audio API | `static/js/reproductor.js` | Interfaz: ~120 ms; lluvia: ruido filtrado | Generados en el navegador; no usan grabaciones del juego. Controles independientes. |

La máscara reinterpretada y los cursores dibujados anteriormente se retiraron del sitio. Mientras no exista un cursor original autorizado se usa el cursor nativo del navegador; los campos mantienen el cursor de texto.

## Recursos identificados, pendientes y no incluidos

| Recurso | Fuente / titular | Tipo y tamaño disponible | Animaciones / estado | Ubicación y componente previstos |
|---|---|---|---|---|
| Cursor original | [Wiki: Cursor.png](https://hollowknight.wiki/w/Category:X_HK_Sprites_Inventory); Team Cherry | PNG 37 × 37 | Sin animación; autorización para este sitio no verificada | `static/authorized/cursor.png`; cursor CSS con hotspot a verificar. No cargado. |
| Brillo original del cursor | [Wiki: Cursor glow.png](https://hollowknight.wiki/w/Category:X_HK_Sprites_Inventory); Team Cherry | PNG 34 × 37 | Sin animación; autorización no verificada | `static/authorized/cursor-glow.png`; capa opcional. No cargado. |
| Knight, Crawlid, Tiktik, Vengefly, Mosscreep y escenarios | [The Spriters Resource: Hollow Knight](https://www.spriters-resource.com/pc_computer/hollowknight/); Team Cherry | Sprites; medidas varían según hoja | Idle, movimiento y demás ciclos: verificar por hoja; autorización no verificada | `static/authorized/hollow-knight/`; `static/js/personajes.js`. No cargados. |
| Hornet, Lace y criaturas de Pharloom | [The Spriters Resource: Silksong](https://www.spriters-resource.com/pc_computer/hollowknightsilksong/); Team Cherry | Sprites; medidas por verificar | Fotogramas y licencia por verificar | `static/authorized/silksong/`; controlador opcional. No cargados. |
| Pack comunitario | [Silksong Sprites de ilves15](https://ilves15.itch.io/hollow-knight-silksong-sprites) | Sprites; dimensiones por verificar | La disponibilidad comunitaria no acredita derechos de los gráficos originales | Solo referencia. |
| Hornet Desktop Companion | [Repositorio CamoLover](https://github.com/CamoLover/Hornet-Desktop-Companion) | Código GPL-3.0 y recursos asociados | La licencia del código no acredita derechos de terceros sobre sprites o música | Solo referencia; no se importó código ni arte. |
| Enter Pharloom | [Álbum oficial de Silksong](https://christopherlarkin.bandcamp.com/album/hollow-knight-silksong-original-soundtrack); Christopher Larkin | Audio; duración y archivo por suministrar | Pendiente de archivo y autorización. El reproductor permite dos pistas cuando se suministre. | `static/authorized/enter-pharloom.mp3`; atributo `data-pharloom` en las plantillas que cargan `reproductor.js`. No cargado. |
| Efectos de Hollow Knight | [Catálogo de sonidos](https://sounds.spriters-resource.com/pc_computer/hollowknight/); titulares del juego | Audio; formatos y duraciones variables | Autorización no verificada | Solo referencia. |
| Efecto de Hornet | [Catálogo de sonido Silksong](https://sounds.spriters-resource.com/pc_computer/hollowknightsilksong/asset/484688/); titulares del juego | Audio; formato y duración por verificar | Autorización no verificada | Solo referencia. |
| Cursor comunitario de Windows | [Publicación de QuantumFighter](https://www.reddit.com/r/HollowKnight/comments/cpj62w/) | CUR derivado de imagen del juego | Adaptación comunitaria; derechos del recurso original no verificados | Solo referencia. |
| Skins comunitarias | [HKSkins](https://hkskins.art/) | Varias hojas / tamaños | Licencias y titularidad varían; no implica autorización automática | Solo referencia. |
| Sonidos de interfaz CC0 | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) | 100 archivos de audio, medidas no aplicables | El catálogo declara CC0; no descargados ni utilizados | Alternativa de referencia a la síntesis propia. |

La [política de Team Cherry](https://www.teamcherry.com.au/faq) distingue la creación de contenido de otras formas de uso y no es una licencia general para publicar sprites, música o material de marketing en esta aplicación. Antes de integrar un recurso original, conservar evidencia del permiso para el archivo y el uso web concretos.

## Integración posterior

1. Incorporar únicamente un archivo cuyo permiso cubra el uso web y distribución, conservando su evidencia fuera del repositorio.
2. Para la segunda canción, añadir la ruta estática a `data-pharloom` en las plantillas que cargan el reproductor. Con dos archivos, los botones anterior/siguiente se habilitan y la cola alterna automáticamente. Sin ella, el reproductor repite la pista disponible.
3. Para sprites, proporcionar la hoja exacta, dimensiones y cantidad real de fotogramas por estado a `PersonajeAmbiental`. El controlador no se instancia automáticamente ni inventa animaciones.
4. Para el cursor original, comprobar también el hotspot real y dejar `auto` como respaldo.

La música conserva pista, posición aproximada, volumen y preferencias entre páginas mediante almacenamiento del navegador. Al navegar con recarga completa hay una interrupción inevitable; algunos navegadores requieren otra interacción para reanudar el audio.

## Privacidad

El listado público y el detalle muestran actualmente RUT, nombre y motivo según el contrato existente. Se recomienda evaluar con el responsable si deben anonimizarse o requerir autenticación. No se cambió el contrato ni se migraron los registros.
