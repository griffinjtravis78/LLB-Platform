import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://wznvgtbastvkjbphaug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bnZndGJhc3R2a2picGhhdWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxOTAyNjAwMCwiZXhwIjoyMDM0NjAyMDAwfQ.placeholder'; // Replace with your active anon key if needed
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class LLBApp {
    constructor() {
        this.currentUser = null;
        this.currentTenant = null;
        this.userProfile = null;
        this.activeModule = 'onboarding';
        this.initInactivityTimer();
    }

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user || null;

        if (!this.currentUser) {
            this.renderLogin();
            return;
        }

        await this.loadUserProfile();
        
        if (!this.userProfile || !this.userProfile.disclaimer_accepted) {
            this.renderDisclaimerModal();
        } else {
            this.renderDashboard();
        }
    }

    async loadUserProfile() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('id', this.currentUser.id)
                .single();

            if (error || !data) {
                console.warn('No profile/tenant found for user. Prompting setup.');
                this.userProfile = { role: 'user' };
                this.currentTenant = null;
            } else {
                this.userProfile = data;
                this.currentTenant = data.tenants;
            }
        } catch (err) {
            console.error('Error loading user profile:', err);
        }
    }

    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="text-[#C5A059] text-2xl font-bold tracking-widest">LLB ERP</span>
                        <p class="text-gray-400 text-sm mt-1">Life, Legacy, and Bereavement</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-gray-800 pt-4">
                        <button type="button" id="toggle-mode" class="text-xs text-[#C5A059] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Register here</button>
                    </div>
                </div>
            </div>
        `;

        let isRegistering = false;
        document.getElementById('toggle-mode').addEventListener('click', () => {
            isRegistering = !isRegistering;
            document.getElementById('submit-btn').textContent = isRegistering ? 'Create Account' : 'Secure Login';
            document.getElementById('toggle-mode').textContent = isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register here';
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (isRegistering) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    alert(error.message);
                } else {
                    alert('Registration successful! You can now log in.');
                    window.location.reload();
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message);
                else window.location.reload();
            }
        });
    }

    renderDisclaimerModal() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <h2 class="text-lg font-bold text-[#C5A059] mb-4">Legal & UPL Notice</h2>
                    <div class="text-gray-300 text-xs space-y-3 max-h-60 overflow-y-auto mb-6 p-3 bg-[#0E0E0E] rounded border border-gray-800">
                        <p><strong>Notice of Operational Scope:</strong> The LLB platform is a secure enterprise estate workflow and operational system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                        <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                        <p>Users are strongly advised to retain licensed legal counsel to validate all estate, trust, and probate execution documents.</p>
                    </div>
                    <label class="flex items-center space-x-3 mb-6 cursor-pointer">
                        <input type="checkbox" id="accept-disclaimer" class="accent-[#C5A059] w-4 h-4" />
                        <span class="text-xs text-gray-300">I acknowledge and accept these operational terms *</span>
                    </label>
                    <button id="proceed-btn" disabled class="w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed">Proceed to Master Dashboard</button>
                </div>
            </div>
        `;

        const checkbox = document.getElementById('accept-disclaimer');
        const proceedBtn = document.getElementById('proceed-btn');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                proceedBtn.disabled = false;
                proceedBtn.className = 'w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition cursor-pointer';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.className = 'w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed';
            }
        });

        proceedBtn.addEventListener('click', async () => {
            if (!checkbox.checked) return;
            
            // Update profile disclaimer acceptance in DB if profile exists
            if (this.userProfile?.id) {
                await supabase.from('profiles').update({ disclaimer_accepted: true }).eq('id', this.userProfile.id);
            }
            window.location.reload();
        });
    }

    renderDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] text-gray-100 flex">
                <aside class="w-64 bg-[#161616] border-r border-[#C5A059]/20 p-4 flex flex-col justify-between">
                    <div>
                        <div class="mb-6">
                            <span class="text-[#C5A059] font-bold text-lg tracking-wider">ESTATE ERP</span>
                            <p class="text-xs text-gray-400">Role: ${this.userProfile?.role || 'User'}</p>
                        </div>
                        <nav id="module-nav" class="space-y-1 overflow-y-auto max-h-[calc(100vh-150px)] text-xs">
                            <!-- Populated dynamically -->
                        </nav>
                    </div>
                    <button id="logout-btn" class="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 py-2 rounded text-xs transition border border-red-700/50">Sign Out</button>
                </aside>
                <main class="flex-1 p-8 overflow-y-auto">
                    <div id="module-container" class="bg-[#161616] border border-[#C5A059]/20 p-6 rounded-lg">
                        <!-- Module content renders here -->
                    </div>
                </main>
            </div>
        `;

        this.renderNavigation();
        this.loadModule(this.activeModule);

        document.getElementById('logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }

    renderNavigation() {
        const modules = [
            { id: 'onboarding', label: 'Module 0: Onboarding' },
            { id: 'vitals', label: 'Module 1: Vitals & Contacts' },
            { id: 'realestate', label: 'Module 2: Real Estate' },
            { id: 'digital', label: 'Module 3: Digital Assets' },
            { id: 'valuables', label: 'Module 4: Physical Valuables' },
            { id: 'vehicles', label: 'Module 5: Vehicles & Titles' },
            { id: 'ip', label: 'Module 6: Intellectual Property' },
            { id: 'business', label: 'Module 7: Business Interests' },
            { id: 'investments', label: 'Module 8: Investments' },
            { id: 'mortuary', label: 'Module 9: Mortuary Hub' }
        ];

        const navHtml = modules.map(m => `
            <button data-module="${m.id}" class="w-full text-left px-3 py-2 rounded transition ${this.activeModule === m.id ? 'bg-[#C5A059] text-[#0E0E0E] font-bold' : 'text-gray-300 hover:bg-gray-800'}">
                ${m.label} *
            </button>
        `).join('');

        document.getElementById('module-nav').innerHTML = navHtml;

        document.querySelectorAll('#module-nav button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeModule = e.target.getAttribute('data-module');
                this.renderNavigation();
                this.loadModule(this.activeModule);
            });
        });
    }

    loadModule(moduleId) {
        const container = document.getElementById('module-container');
        container.innerHTML = `<h3 class="text-lg font-bold text-[#C5A059] mb-4">Loading Module...</h3>`;
        // Module forms render here based on selection
        setTimeout(() => {
            container.innerHTML = `
                <h3 class="text-lg font-bold text-[#C5A059] mb-4 uppercase tracking-wider">Module: ${moduleId}</h3>
                <p class="text-xs text-gray-400 mb-4">Active multi-tenant record management interface.</p>
                <div class="p-4 bg-[#0E0E0E] rounded border border-gray-800 text-xs text-gray-300">
                    Module workflow active and bound to tenant ID: ${this.currentTenant?.id || 'Unlinked'}
                </div>
            `;
        }, 100);
    }

    initInactivityTimer() {
        let inactivityTimer;
        const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

        const resetTimer = async () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.auth.signOut();
                    alert('Session expired due to inactivity.');
                    window.location.reload();
                }
            }, TIMEOUT_DURATION);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetTimer, true);
        });
        resetTimer();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new LLBApp();
    app.init();
});
