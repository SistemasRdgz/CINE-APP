import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import Icon from '../ui/Icon';
import { uriPoster } from '../services/imagenes';
import { useTheme, Palette } from '../ui/theme';
// Portada vectorial local por género para películas sin fotografía.
export default function Poster({ nombre, genero, imagen, preview }: { nombre: string; genero: string; imagen?: string; preview?: string }) {
  const { colors: c } = useTheme();
  const s = React.useMemo(() => makeStyles(c), [c]);

  const uri = preview ?? uriPoster(imagen);
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [uri]);
  const alegre = ['Comedia', 'Animación', 'Romance'].includes(genero);
  return <View style={s.root}>
    {uri && !fallo ? <Image source={{ uri }} style={s.image} resizeMode="cover" onError={() => setFallo(true)} accessibilityLabel={`Póster de ${nombre}`} /> : <>
      <Svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice">
        <Defs><LinearGradient id="poster" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={alegre ? '#99532F' : '#172D3B'} /><Stop offset="1" stopColor={alegre ? '#321B32' : '#090C16'} /></LinearGradient></Defs>
        <Rect width="300" height="450" fill="url(#poster)" />
        <Circle cx="225" cy="95" r="70" fill={alegre ? '#F3C784' : '#BCCCDC'} opacity={0.75} />
        <Path d="M0 270 L80 170 L160 265 L230 185 L300 270 V450 H0Z" fill={alegre ? '#8B343E' : '#173D47'} />
        <Path d="M0 345 Q100 240 165 330 T300 300 V450 H0Z" fill={alegre ? '#452035' : '#0D202F'} />
        <Rect x="18" y="18" width="264" height="414" rx="4" fill="none" stroke="#D9B776" strokeOpacity={0.4} />
      </Svg>
      <View style={s.overlay}><View style={s.brand}><Icon name="movie-open-outline" size={20} color="#D9B776" /><Text style={s.brandText}>CINEAPP</Text></View><Text style={s.name} numberOfLines={4}>{nombre || 'Tu próxima historia'}</Text><Text style={s.genre}>{genero || 'CINE'}</Text></View>
    </>}
  </View>;
}
const makeStyles = (c: Palette) => StyleSheet.create({ root: { width: '100%', aspectRatio: 2 / 3, backgroundColor: c.raised, overflow: 'hidden', borderRadius: 14 }, image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'flex-end' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }, brandText: { color: '#D9B776', fontSize: 10, letterSpacing: 2 },
  name: { color: '#F5F1EA', fontSize: 23, fontWeight: '800', lineHeight: 27 }, genre: { color: '#D9B776', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginTop: 12 },
});
