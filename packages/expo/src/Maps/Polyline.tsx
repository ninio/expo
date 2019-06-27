import * as React from 'react';
import { Polyline as GoogleMapsPolyline } from 'react-google-maps';

type Props = {
  strokeWidth: number | null;
  strokeColor: string | null;
  strokeOpacity: number | null;
  path: string;
};

class Polyline extends React.Component<Props> {
  render() {
    const { strokeWidth, strokeColor, strokeOpacity, path } = this.props;
    return <GoogleMapsPolyline path={path} options={{
        strokeColor,
        strokeWidth,
        strokeOpacity
    }} />;
  }
}

export default Polyline;
