// ============================================================================
// Valeria+ · ErrorBoundary global
// Muestra a Lúa con un mensaje sereno y el botón «Volver al inicio» en el
// idioma activo, registrando únicamente el nombre de la pantalla en la
// telemetría local (sin datos personales).
// ============================================================================
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CatPixel } from './ValeriaCatPixel';
import { tNow } from './i18n/catalog';
import { trackScreenError } from './valeriaTelemetry';
import { V } from './valeriaTheme';
import { FONT } from './ui/fonts';

interface Props {
  children: React.ReactNode;
  getScreenName?: () => string | undefined;
  onBackHome?: () => void;
}

interface State {
  hasError: boolean;
  resetKey: number;
}

export class ValeriaErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(): void {
    trackScreenError(this.props.getScreenName?.());
  }

  private handleReset = (): void => {
    this.props.onBackHome?.();
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
    }
    const copy = tNow().errorBoundary;
    return (
      <View style={s.root}>
        <View style={s.card}>
          <CatPixel size={96} pose="head" />
          <Text style={s.title}>{copy.title}</Text>
          <Text style={s.body}>{copy.body}</Text>
          <Pressable
            onPress={this.handleReset}
            style={s.btn}
            accessibilityRole="button"
            accessibilityLabel={copy.backHome}
          >
            <Text style={s.btnTxt}>{copy.backHome}</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6FAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6ECEB',
  },
  title: {
    fontFamily: FONT.bodyBlack,
    fontSize: 20,
    color: V.color.textPrimary,
    textAlign: 'center',
    marginTop: 18,
  },
  body: {
    fontFamily: FONT.body,
    fontSize: 15,
    lineHeight: 22,
    color: V.color.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 22,
  },
  btn: {
    backgroundColor: V.color.primaryDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default ValeriaErrorBoundary;
