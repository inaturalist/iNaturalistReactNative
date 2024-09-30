date-observed = Fecha de observación: { $date }
date-uploaded = Fecha de subido: { $date }
# Label for a view that shows observations as a grid of photos
Grid-View = Ver rejilla
# Latitude, longitude, and accuracy on a single line
Lat-Lon-Acc = Lat: { NUMBER($latitude, maximumFractionDigits: 6) }, Lon: { NUMBER($longitude, maximumFractionDigits: 6) }, Pre: { $accuracy }
# Label for a view that shows observations a list
List-View = Ver lista
Observation = Observación
Observations = Observaciones
TAXONOMY-header = TAXONOMIE es bueno
Welcome-to-iNaturalist = ¡Bienvenido a iNaturalist!
Welcome-user = <0>Bienvenido de nuevo,</0><1>{ $userHandle }</1>
X-Observations =
    { $count ->
        [one] 1 Observación
       *[other] { $count } Observaciones
    }
Your-Observations = Sus observaciones
