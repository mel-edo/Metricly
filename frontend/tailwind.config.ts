
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Catppuccin Mocha Color Palette
				rosewater: '#f5e0dc',
				flamingo: '#f2cdcd',
				pink: '#f5c2e7',
				mauve: '#cba6f7',
				red: '#f38ba8',
				maroon: '#eba0ac',
				peach: '#fab387',
				yellow: '#f9e2af',
				green: '#a6e3a1',
				teal: '#94e2d5',
				sky: '#89dceb',
				sapphire: '#74c7ec',
				blue: '#89b4fa',
				lavender: '#b4befe',
				text: '#cdd6f4',
				subtext1: '#bac2de',
				subtext0: '#a6adc8',
				overlay2: '#9399b2',
				overlay1: '#7f849c',
				overlay0: '#6c7086',
				surface2: '#585b70',
				surface1: '#45475a',
				surface0: '#313244',
				base: '#1e1e2e',
				mantle: '#181825',
				crust: '#11111b',
				
				// Catppuccin Latte Color Palette
                latte: {
                    rosewater: '#dc8a78',
                    flamingo: '#dd7878',
                    pink: '#ea76cb',
                    mauve: '#8839ef',
                    red: '#d20f39',
                    maroon: '#e64553',
                    peach: '#fe640b',
                    yellow: '#df8e1d',
                    green: '#40a02b',
                    teal: '#179299',
                    sky: '#04a5e5',
                    sapphire: '#209fb5',
                    blue: '#1e66f5',
                    lavender: '#7287fd',
                    text: '#4c4f69',
                    subtext1: '#5c5f77',
                    subtext0: '#6c6f85',
                    overlay2: '#7c7f93',
                    overlay1: '#8c8fa1',
                    overlay0: '#9ca0b0',
                    surface2: '#acb0be',
                    surface1: '#bcc0cc',
                    surface0: '#ccd0da',
                    base: '#eff1f5',
                    mantle: '#e6e9ef',
                    crust: '#dce0e8',
                },
				
				// Original shadcn variables
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                metricly: {
                    background: '#181825', // mantle
                    secondary: '#1e1e2e', // base
                    accent: '#b4befe', // lavender
                    success: '#a6e3a1', // green
                    warning: '#f9e2af', // yellow
                    error: '#f38ba8', // red
                    info: '#89b4fa' // blue
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
                'fade-in': {
                    '0%': {
                        opacity: '0'
                    },
                    '100%': {
                        opacity: '1'
                    }
                },
                'pulse-subtle': {
                    '0%, 100%': {
                        opacity: '1'
                    },
                    '50%': {
                        opacity: '0.8'
                    }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
