import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://wznvgtbastvvkjbphauq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z6SG8qHcHtpI3dp3DTfGJg_XB5buB2P';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storage: window.sessionStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

class LLBApp {
    constructor() {
        this.currentUser = null;
        this.currentTenant = null;
        this.userProfile = null;
        this.activeModule = 'onboarding';
        this.initInactivityTimer();
    }

    async init() {
        try {
            const appElement = document.getElementById('app');
            if (!appElement) {
                console.error("Critical: #app element missing from DOM.");
                return;
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            this.currentUser = session?.user || null;

            if (!this.currentUser) {
                this.renderLogin();
                return;
            }

            await this.loadOrCreateUserProfile();
            
            if (!this.userProfile || !this.userProfile.disclaimer_accepted) {
                this.renderDisclaimerModal();
            } else {
                this.renderDashboard();
            }
        } catch (err) {
            console.error('Initialization error:', err);
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div class="min-h-screen bg-[#0E0E0E] text-red-400 flex items-center justify-center p-6 text-center">
                        <div class="bg-[#161616] border border-red-900/50 p-6 rounded-lg max-w-md">
                            <h3 class="font-bold text-sm mb-2 uppercase tracking-widest">Initialization Error</h3>
                            <p class="text-xs text-gray-300">${err.message}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    async loadOrCreateUserProfile() {
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('id', this.currentUser.id)
                .single();

            if (error || !data) {
                console.log('No profile found. Automatically provisioning profile and tenant...');
                
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .insert([{ name: `${this.currentUser.email.split('@')[0]}'s Estate` }])
                    .select()
                    .single();

                if (tenantError) {
                    console.error('Error creating tenant:', tenantError);
                }

                const tenantId = tenantData ? tenantData.id : null;

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .upsert([{ 
                        id: this.currentUser.id, 
                        role: 'admin', 
                        disclaimer_accepted: false,
                        tenant_id: tenantId
                    }])
                    .select('*, tenants(*)')
                    .single();

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    this.userProfile = { id: this.currentUser.id, role: 'admin', disclaimer_accepted: false };
                    this.currentTenant = null;
                } else {
                    this.userProfile = profileData;
                    this.currentTenant = profileData.tenants;
                }
            } else {
                this.userProfile = data;
                this.currentTenant = data.tenants;
            }
        } catch (err) {
            console.error('Error in loadOrCreateUserProfile:', err);
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
                        <button type="button" id="to-register-btn" class="text-xs text-[#C5A059] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Module 0 Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('to-register-btn').addEventListener('click', () => {
            this.renderModule0Registration();
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
            } else {
                window.location.reload();
            }
        });
    }

    renderModule0Registration() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="text-[#C5A059] text-xl font-bold tracking-widest uppercase">Module 0: Onboarding & Registration</span>
                        <p class="text-gray-400 text-xs mt-1">Configure your estate account and support tracks</p>
                    </div>
                    <form id="register-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                            <input type="email" id="reg-email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="reg-password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Support Track Selection *</label>
                            <select id="support-track" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs">
                                <option value="Track_A">Track A - Comprehensive Primary Estate Management</option>
                                <option value="Track_B">Track B - Accelerated Modular Setup</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Contact Name</label>
                            <input type="text" id="proxy-name" placeholder="Optional initial delegate" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition text-xs uppercase tracking-wider">Complete Registration & Initialize Profile</button>
                    </form>
                    <div class="mt-6 text-center border-t border-gray-800 pt-4">
                        <button type="button" id="back-to-login" class="text-xs text-gray-400 hover:text-[#C5A059] bg-transparent border-none cursor-pointer">Already have an account? Sign in</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-to-login').addEventListener('click', () => {
            this.renderLogin();
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const supportTrack = document.getElementById('support-track').value;
            const proxyName = document.getElementById('proxy-name').value;

            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    data: {
                        support_track: supportTrack,
                        proxy_name: proxyName
                    }
                }
            });

            if (error) {
                alert(error.message);
            } else {
                alert('Module 0 Registration successful! Please log in with your new credentials.');
                this.renderLogin();
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
            
            if (this.currentUser?.id) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ disclaimer_accepted: true })
                    .eq('id', this.currentUser.id);

                if (error) {
                    console.error('Error saving disclaimer acceptance:', error);
                    alert('Error saving acceptance: ' + error.message);
                    return;
                }
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
                            <p class="text-[10px] text-gray-500 mt-1 truncate">Tenant: ${this.currentTenant?.name || 'Active'}</p>
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
            { id: 'parents', label: 'Module 2: Parents' },
            { id: 'education', label: 'Module 3: Education' },
            { id: 'employment', label: 'Module 4: Employment' },
            { id: 'civic', label: 'Module 5: Civic' },
            { id: 'faith', label: 'Module 6: Faith' },
            { id: 'military', label: 'Module 7: Military' },
            { id: 'cultural', label: 'Module 8: Cultural' },
            { id: 'disposition', label: 'Module 9: Disposition' },
            { id: 'aesthetics', label: 'Module 10: Aesthetics' },
            { id: 'participants', label: 'Module 11: Participants' },
            { id: 'photos', label: 'Module 12: Photos' },
            { id: 'stories', label: 'Module 13: Stories' },
            { id: 'itineraries', label: 'Module 14: Itineraries' },
            { id: 'financial', label: 'Module 15: Financial' },
            { id: 'insurance', label: 'Module 16: Insurance' },
            { id: 'utilities', label: 'Module 17: Utilities' },
            { id: 'storage', label: 'Module 18: Storage' }
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
        setTimeout(() => {
            if (moduleId === 'onboarding') {
                container.innerHTML = `
                    <h3 class="text-lg font-bold text-[#C5A059] mb-4 uppercase tracking-wider">Module 0: Onboarding & Support Tracks</h3>
                    <p class="text-xs text-gray-400 mb-4">Manage account registration settings, support tracks, and proxy authentication configurations.</p>
                    <div class="p-4 bg-[#0E0E0E] rounded border border-gray-800 text-xs text-gray-300 space-y-2">
                        <p><strong>Active Tenant ID:</strong> ${this.currentTenant?.id || 'Unlinked'}</p>
                        <p><strong>Assigned Role:</strong> ${this.userProfile?.role || 'Admin'}</p>
                        <p><strong>Support Track:</strong> Active Onboarding Profile</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <h3 class="text-lg font-bold text-[#C5A059] mb-4 uppercase tracking-wider">Module: ${moduleId}</h3>
                    <p class="text-xs text-gray-400 mb-4">Active multi-tenant record management interface aligned with master schema.</p>
                    <div class="p-4 bg-[#0E0E0E] rounded border border-gray-800 text-xs text-gray-300">
                        Table data binding active for module_${moduleId} | Tenant ID: ${this.currentTenant?.id || 'Unlinked'}
                    </div>
                `;
            }
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
