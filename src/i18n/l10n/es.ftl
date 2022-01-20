count-observations =
    { $count ->
        [one] 1 observation
       *[other] { $count } observations
    }
date-observed = Date observed: { $date }
date-uploaded = Date uploaded: { $date }
# Label for a view that shows observations as a grid of photos
Grid-View = Grid View
# Label for a view that shows observations a list
List-View = List View
OBSERVATIONS = OBSERVATIONS
Observations = Observations
Your-Observations = Sus observaciones
