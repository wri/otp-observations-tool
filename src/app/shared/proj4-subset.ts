import proj4 from 'proj4/lib/core';
import Proj from 'proj4/lib/Proj';
import Point from 'proj4/lib/Point';
import toPoint from 'proj4/lib/common/toPoint';
import defs from 'proj4/lib/defs';
import nadgrid from 'proj4/lib/nadgrid';
import transform from 'proj4/lib/transform';
import projections from 'proj4/lib/projections';
import utm from 'proj4/lib/projections/utm';

// The full 'proj4' entry point registers all ~40 projections (~74kB of the bundle).
// The app only ever converts between longlat/WGS84 and UTM, so we assemble the same
// public API here and register just the projections we use.
// `Proj` already calls projections.start(), which registers merc + longlat.
projections.add(utm);

proj4.defaultDatum = 'WGS84';
proj4.Proj = Proj;
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = Point;
proj4.toPoint = toPoint;
proj4.defs = defs;
proj4.nadgrid = nadgrid;
proj4.transform = transform;

export default proj4;
