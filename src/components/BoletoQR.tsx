import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import qrcode from 'qrcode-generator';
import { contenidoQR } from '../domain/cine';

export default function BoletoQR({ id }: { id: string }) {
  const { dimension, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(contenidoQR(id));
    qr.make();
    const size = qr.getModuleCount();
    const cells: string[] = [];
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      if (qr.isDark(r, c)) cells.push(`M${c + 4},${r + 4}h1v1h-1z`);
    }
    return { dimension: size + 8, path: cells.join('') };
  }, [id]);
  return <View style={styles.qr} accessible accessibilityLabel={`Código QR de la reserva ${id}`}>
    <Svg width={220} height={220} viewBox={`0 0 ${dimension} ${dimension}`}>
      <Rect width={dimension} height={dimension} fill="white" />
      <Path d={path} fill="black" />
    </Svg>
  </View>;
}
const styles = StyleSheet.create({ qr: { alignItems: 'center', marginVertical: 12, backgroundColor: 'white' } });
