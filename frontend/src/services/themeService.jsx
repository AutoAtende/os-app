import { createTheme } from '@mui/material/styles';

class ThemeService {
  constructor() {
    this.defaultTheme = {
      light: this.createLightTheme(),
      dark: this.createDarkTheme()
    };
  }

  createLightTheme() {
    return createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#2196F3',
          light: '#64B5F6',
          dark: '#1976D2',
          contrastText: '#fff'
        },
        secondary: {
          main: '#FF9800',
          light: '#FFB74D',
          dark: '#F57C00',
          contrastText: '#fff'
        },
        error: {
          main: '#F44336',
          light: '#E57373',
          dark: '#D32F2F',
          contrastText: '#fff'
        },
        warning: {
          main: '#FFA726',
          light: '#FFB74D',
          dark: '#F57C00',
          contrastText: '#fff'
        },
        info: {
          main: '#29B6F6',
          light: '#4FC3F7',
          dark: '#0288D1',
          contrastText: '#fff'
        },
        success: {
          main: '#66BB6A',
          light: '#81C784',
          dark: '#388E3C',
          contrastText: '#fff'
        },
        background: {
          default: '#F5F5F5',
          paper: '#FFFFFF'
        }
      },
      typography: {
        fontFamily: [
          'Roboto',
          'Arial',
          'sans-serif'
        ].join(','),
        h1: {
          fontSize: '2.5rem',
          fontWeight: 500
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 500
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 500
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 500
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 500
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 500
        }
      },
      shape: {
        borderRadius: 8
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none'
            }
          }
        }
      }
    });
  }

  createDarkTheme() {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#90CAF9',
          light: '#BBDEFB',
          dark: '#42A5F5',
          contrastText: '#000'
        },
        secondary: {
          main: '#FFB74D',
          light: '#FFCC80',
          dark: '#FFA726',
          contrastText: '#000'
        },
        background: {
          default: '#121212',
          paper: '#1E1E1E'
        }
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
            }
          }
        }
      }
    });
  }

  getCustomTheme(options = {}) {
    const {
      primaryColor,
      secondaryColor,
      fontFamily,
      borderRadius,
      mode = 'light'
    } = options;

    const baseTheme = mode === 'light' ? this.createLightTheme() : this.createDarkTheme();

    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: primaryColor ? {
          main: primaryColor,
          light: this.adjustColor(primaryColor, 20),
          dark: this.adjustColor(primaryColor, -20)
        } : baseTheme.palette.primary,
        secondary: secondaryColor ? {
          main: secondaryColor,
          light: this.adjustColor(secondaryColor, 20),
          dark: this.adjustColor(secondaryColor, -20)
        } : baseTheme.palette.secondary
      },
      typography: fontFamily ? {
        ...baseTheme.typography,
        fontFamily: [
          fontFamily,
          'Roboto',
          'Arial',
          'sans-serif'
        ].join(',')
      } : baseTheme.typography,
      shape: borderRadius ? {
        ...baseTheme.shape,
        borderRadius
      } : baseTheme.shape
    });
  }

  adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  getContrastText(backgroundColor) {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }

  getCustomStyles(overrides = {}) {
    return {
      globalStyles: {
        '.page-container': {
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        },
        '.card-hover': {
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        },
        '.truncate': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        },
        ...overrides
      },
      components: {
        dashboardCard: {
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          height: '100%'
        },
        dataTable: {
          root: {
            boxShadow: 'none',
            border: '1px solid rgba(224, 224, 224, 1)'
          },
          head: {
            backgroundColor: '#f5f5f5'
          }
        },
        form: {
          container: {
            maxWidth: '800px',
            margin: '0 auto'
          },
          section: {
            marginBottom: '32px'
          }
        }
      }
    };
  }

  getStatusColors() {
    return {
      active: '#4CAF50',
      inactive: '#9E9E9E',
      maintenance: '#FFA726',
      warning: '#FF9800',
      error: '#F44336',
      success: '#4CAF50',
      info: '#2196F3'
    };
  }

  getPriorityColors() {
    return {
      low: '#66BB6A',
      medium: '#FFA726',
      high: '#F44336',
      critical: '#D32F2F'
    };
  }

  getMaintenanceTypeColors() {
    return {
      preventive: '#4CAF50',
      corrective: '#FF9800',
      predictive: '#2196F3'
    };
  }

  getChartColors() {
    return {
      primary: ['#2196F3', '#64B5F6', '#90CAF9', '#BBDEFB'],
      secondary: ['#FF9800', '#FFB74D', '#FFCC80', '#FFE0B2'],
      success: ['#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'],
      error: ['#F44336', '#E57373', '#EF9A9A', '#FFCDD2']
    };
  }

  getAccessibilityStyles(isHighContrast = false) {
    return {
      typography: {
        fontSize: isHighContrast ? 16 : 14,
        fontWeight: isHighContrast ? 500 : 400
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              padding: isHighContrast ? '12px 24px' : '8px 16px',
              fontSize: isHighContrast ? '1.1rem' : '1rem'
            }
          }
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontSize: isHighContrast ? '1.1rem' : '1rem'
            }
          }
        }
      }
    };
  }

  generateCustomPalette(baseColor) {
    const colors = [];
    for (let i = 900; i >= 50; i -= 100) {
      colors.push(this.adjustColor(baseColor, (i - 500) / 10));
    }
    return {
      50: colors[8],
      100: colors[7],
      200: colors[6],
      300: colors[5],
      400: colors[4],
      500: colors[3], // Base color
      600: colors[2],
      700: colors[1],
      800: colors[0],
      900: this.adjustColor(colors[0], -10)
    };
  }

  applyThemeToElements() {
    document.documentElement.style.setProperty('--primary-color', this.defaultTheme.light.palette.primary.main);
    document.documentElement.style.setProperty('--secondary-color', this.defaultTheme.light.palette.secondary.main);
    document.documentElement.style.setProperty('--background-color', this.defaultTheme.light.palette.background.default);
    document.documentElement.style.setProperty('--text-color', this.defaultTheme.light.palette.text.primary);
  }
}

export default new ThemeService();