// File: src/app.js
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
        this.activeModule = 'module00';
        this.initInactivityTimer();
    }

    async init() {
        try {
            const appElement = document.getElementById('app');
            if (!appElement) {
                console.error("Critical: #app element missing from DOM.");
                return;
            }

            appElement.innerHTML = `
                <div class="min-h-[60vh] flex items-center justify-center">
                    <div class="text-xs text-[#D8C3A5] font-mono animate-pulse uppercase tracking-widest">Loading LLB Platform...</div>
                </div>
            `;

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
            } else if ((this.userProfile?.access_tier || 0) === 0) {
                this.renderTierSelection();
            } else {
                this.renderDashboard();
            }
        } catch (err) {
            console.error('Initialization error:', err);
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.innerHTML = `
                    <div class="min-h-[60vh] text-red-300 flex items-center justify-center p-6 text-center">
                        <div class="bg-[#485664] border border-red-900/50 p-6 rounded-lg max-w-md shadow-xl">
                            <h3 class="font-bold text-sm mb-2 uppercase tracking-widest text-[#D8C3A5]">Initialization Error</h3>
                            <p class="text-xs text-gray-200">${err.message}</p>
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
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .insert([{ estate_phase: 'phase_1_living' }])
                    .select()
                    .single();

                const tenantId = tenantData ? tenantData.id : null;

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .upsert([{ 
                        id: this.currentUser.id, 
                        role: 'customer', 
                        access_tier: 0,
                        disclaimer_accepted: false,
                        tenant_id: tenantId
                    }])
                    .select('*, tenants(*)')
                    .single();

                if (profileError) {
                    this.userProfile = { id: this.currentUser.id, role: 'customer', access_tier: 0, disclaimer_accepted: false };
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
            <div class="flex flex-col items-center justify-center py-8 px-4">
                <div class="text-center mb-6">
                    <img src="./LLB.jpeg" alt="LLB Logo" class="h-24 w-auto mx-auto rounded-xl border-2 border-[#D8C3A5]/50 object-contain bg-white p-2 shadow-xl mb-3">
                    <h1 class="text-2xl font-bold text-[#D8C3A5] tracking-widest uppercase">LLB Platform</h1>
                    <p class="text-xs text-gray-300 mt-1">Life, Legacy, and Bereavement Enterprise ERP</p>
                </div>

                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-xl max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-lg font-bold text-[#D8C3A5] tracking-wider">SECURE LOGIN</h2>
                        <p class="text-gray-300 text-xs mt-1">Enter your credentials to access your estate workspace</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-[#6A7B8C] pt-4">
                        <button type="button" id="to-register-btn" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Level 0 Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('to-register-btn').addEventListener('click', () => {
            const container = document.getElementById('app');
            import('./modules/module00.js').then(mod => {
                if (typeof mod.renderModule00 === 'function') {
                    mod.renderModule00(container);
                }
            }).catch(err => {
                console.error("Error loading Module 0:", err);
            });
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

    renderDisclaimerModal() {
        document.getElementById('app').innerHTML = `
            <div class="flex items-center justify-center py-12 px-4">
                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-lg max-w-lg w-full shadow-2xl">
                    <h2 class="text-lg font-bold text-[#D8C3A5] mb-4 uppercase tracking-wider">Legal & UPL Notice</h2>
                    <div class="text-gray-200 text-xs space-y-3 max-h-60 overflow-y-auto mb-6 p-3 bg-[#2C353D] rounded border border-[#6A7B8C]">
                        <p><strong>Notice of Operational Scope:</strong> The LLB platform is a secure enterprise estate workflow and operational system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                        <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                        <p>Users are strongly advised to retain licensed legal counsel to validate all estate, trust, and probate execution documents.</p>
                    </div>
                    <label class="flex items-center space-x-3 mb-6 cursor-pointer">
                        <input type="checkbox" id="accept-disclaimer" class="accent-[#D8C3A5] w-4 h-4" />
                        <span class="text-xs text-gray-200">I acknowledge and accept these operational terms *</span>
                    </label>
                    <button id="proceed-btn" disabled class="w-full bg-[#6A7B8C] text-gray-300 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider">Proceed to Service Tier Selection</button>
                </div>
            </div>
        `;

        const checkbox = document.getElementById('accept-disclaimer');
        const proceedBtn = document.getElementById('proceed-btn');

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                proceedBtn.disabled = false;
                proceedBtn.className = 'w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.className = 'w-full bg-[#6A7B8C] text-gray-300 font-bold py-2 rounded transition cursor-not-allowed text-xs uppercase tracking-wider';
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
                    alert('Error saving acceptance: ' + error.message);
                    return;
                }
            }
            window.location.reload();
        });
    }

    renderTierSelection() {
        document.getElementById('app').innerHTML = `
            <div class="max-w-6xl mx-auto py-10 px-4 text-gray-100">
                <div class="text-center mb-10">
                    <h1 class="text-2xl font-bold text-[#D8C3A5] tracking-widest uppercase">Select Your Service Tier</h1>
                    <p class="text-xs text-gray-300 mt-2">Choose the track that fits your storage needs, estate complexity, and level of guidance.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Essential Legacy -->
                    <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Starter" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Essential Legacy</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$49</span> <span class="text-xs text-gray-300">setup + $3.99/mo</span>
                                <p class="text-[11px] text-gray-300 mt-1">or $79 / year</p>
                            </div>
                            <ul class="text-xs space-y-2.5 text-gray-200 mb-6">
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> 500 MB Encrypted Storage (Text & basic PDFs)</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Full access to Vitals, Parents, Education, Employment, Civic & Faith modules</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Single DD-214 military record upload</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Capped at 10 high-resolution photos total</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Max 3 historical stories & 1 service itinerary</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Basic financial text tracking (No deed uploads)</li>
                            </ul>
                        </div>
                        <button data-tier="1" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Essential</button>
                    </div>

                    <!-- Comprehensive Estate -->
                    <div class="bg-[#485664] border-2 border-[#D8C3A5] p-6 rounded-xl shadow-2xl flex flex-col justify-between relative">
                        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D8C3A5] text-[#2C353D] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">Most Popular</div>
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Professional" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Comprehensive Estate</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$149</span> <span class="text-xs text-gray-300">setup + $7.99/mo</span>
                                <p class="text-[11px] text-gray-300 mt-1">or $199 / year</p>
                            </div>
                            <ul class="text-xs space-y-2.5 text-gray-200 mb-6">
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> 10 GB Storage (Ample room for photo galleries & deeds)</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Full, unlimited access to Modules 1–11 with add actions</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Up to 100 high-resolution photos with auto-tagging</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Up to 15 historical stories linked to speakers</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Up to 3 multi-service event itineraries (Wake, Funeral, Graveside)</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Full financial and insurance document/deed uploads</li>
                            </ul>
                        </div>
                        <button data-tier="2" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Comprehensive</button>
                    </div>

                    <!-- Enterprise Heritage & Dynasty -->
                    <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                        <div>
                            <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">The "Master" Track</span>
                            <h3 class="text-lg font-bold text-white mt-1">Enterprise Heritage & Dynasty</h3>
                            <div class="my-4 pb-4 border-b border-[#6A7B8C]">
                                <span class="text-2xl font-bold text-[#D8C3A5]">$399</span> <span class="text-xs text-gray-300">setup + $19.99/mo</span>
                                <p class="text-[11px] text-gray-300 mt-1">or $599 / year</p>
                            </div>
                            <ul class="text-xs space-y-2.5 text-gray-200 mb-6">
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> 100 GB+ High-capacity cloud storage (Audio/Video archives)</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Completely Unlimited Access across all 18 modules</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Unlimited photo vault items with C2PA metadata verification</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Unlimited historical stories and multi-service itineraries</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Advanced multi-proxy permission management for assets</li>
                                <li class="flex items-start"><span class="text-[#D8C3A5] mr-2">✓</span> Priority access to human doula on-demand escalation queues</li>
                            </ul>
                        </div>
                        <button data-tier="3" class="tier-select-btn w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Select Enterprise</button>
                    </div>
                </div>

                <div class="mt-8 text-center">
                    <button id="logout-tier-btn" class="text-xs text-red-300 hover:underline bg-transparent border-none cursor-pointer">Sign Out / Return to Login</button>
                </div>
            </div>
        `;

        document.querySelectorAll('.tier-select-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tierLevel = parseInt(e.target.getAttribute('data-tier'));
                const tierName = tierLevel === 1 ? 'Essential Legacy' : tierLevel === 2 ? 'Comprehensive Estate' : 'Enterprise Heritage & Dynasty';

                const { error } = await supabase
                    .from('profiles')
                    .update({ access_tier: tierLevel })
                    .eq('id', this.currentUser.id);

                if (error) {
                    alert('Error saving tier selection: ' + error.message);
                    return;
                }

                alert(`Successfully enrolled in ${tierName}! Unlocking your workspace modules...`);
                window.location.reload();
            });
        });

        document.getElementById('logout-tier-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }

    renderDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="text-gray-100 flex min-h-[85vh]">
                <aside class="w-64 bg-[#485664] border-r border-[#D8C3A5]/20 p-4 flex flex-col justify-between shadow-lg rounded-l-lg">
                    <div>
                        <div class="mb-4 pb-3 border-b border-[#D8C3A5]/20">
                            <span class="text-[#D8C3A5] font-bold text-xs tracking-wider uppercase">Workspace Modules</span>
                            <p class="text-[10px] text-gray-300 mt-0.5">Role: ${this.userProfile?.role || 'Customer'}</p>
                            <p class="text-[10px] text-amber-300 mt-0.5 font-mono">Tier: Level ${this.userProfile?.access_tier || 1}</p>
                        </div>
                        <nav id="module-nav" class="space-y-1 overflow-y-auto max-h-[calc(100vh-240px)] text-xs">
                            <!-- Populated dynamically -->
                        </nav>
                    </div>
                    <button id="logout-btn" class="w-full bg-red-900/60 hover:bg-red-900 text-red-100 py-2 rounded text-xs transition border border-red-700/50 cursor-pointer mt-4">Sign Out</button>
                </aside>
                <main class="flex-1 p-6 overflow-y-auto bg-[#485664]/40 rounded-r-lg">
                    <div id="module-container" class="bg-[#485664] border border-[#D8C3A5]/30 p-6 rounded-lg min-h-[75vh] shadow-xl">
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
        const userTier = this.userProfile?.access_tier || 1;

        const modules = [
            { id: 'module00', label: 'Module 0: Onboarding', minTier: 1 },
            { id: 'module01', label: 'Module 1: Vitals & Contacts', minTier: 1 },
            { id: 'module02', label: 'Module 2: Parents', minTier: 1 },
            { id: 'module03', label: 'Module 3: Education', minTier: 1 },
            { id: 'module04', label: 'Module 4: Employment', minTier: 1 },
            { id: 'module05', label: 'Module 5: Civic', minTier: 1 },
            { id: 'module06', label: 'Module 6: Faith', minTier: 1 },
            { id: 'module07', label: 'Module 7: Military', minTier: 2 },
            { id: 'module08', label: 'Module 8: Cultural', minTier: 2 },
            { id: 'module09', label: 'Module 9: Disposition', minTier: 2 },
            { id: 'module10', label: 'Module 10: Aesthetics', minTier: 2 },
            { id: 'module11', label: 'Module 11: Participants', minTier: 2 },
            { id: 'module12', label: 'Module 12: Photos', minTier: 3 },
            { id: 'module13', label: 'Module 13: Stories', minTier: 3 },
            { id: 'module14', label: 'Module 14: Itineraries', minTier: 3 },
            { id: 'module15', label: 'Module 15: Financial', minTier: 3 },
            { id: 'module16', label: 'Module 16: Insurance', minTier: 3 },
            { id: 'module17', label: 'Module 17: Utilities', minTier: 3 },
            { id: 'module18', label: 'Module 18: Storage', minTier: 3 }
        ];

        const navHtml = modules.map(m => {
            const isLocked = userTier < m.minTier && userTier < 3;
            return `
                <button data-module="${m.id}" ${isLocked ? 'disabled' : ''} class="w-full text-left px-3 py-2 rounded transition ${isLocked ? 'opacity-40 cursor-not-allowed bg-transparent text-gray-500' : this.activeModule === m.id ? 'bg-[#D8C3A5] text-[#2C353D] font-bold shadow' : 'text-gray-200 hover:bg-[#6A7B8C] hover:text-[#D8C3A5]'} cursor-pointer flex justify-between items-center">
                    <span>${m.label}</span>${isLocked ? '<span class="text-[9px] text-amber-400 font-mono">LOCKED</span>' : ''}
                </button>
            `;
        }).join('');

        const navContainer = document.getElementById('module-nav');
        if (navContainer) {
            navContainer.innerHTML = navHtml;
            navContainer.querySelectorAll('button:not([disabled])').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.activeModule = e.currentTarget.getAttribute('data-module');
                    this.renderNavigation();
                    this.loadModule(this.activeModule);
                });
            });
        }
    }

    async loadModule(moduleId) {
        const container = document.getElementById('module-container');
        if (!container) return;
        
        container.innerHTML = `<div class="text-xs text-[#D8C3A5] font-mono animate-pulse">Loading module component...</div>`;
        
        try {
            const modNum = moduleId.replace('module', '');
            const mod = await import(`./modules/module${modNum}.js`);
            
            if (typeof mod[`renderModule${modNum}`] === 'function') { await mod[`renderModule${modNum}`](container);
            } else if (typeof mod.render === 'function') {
                await mod.render(container);
            } else {
                throw new Error(`Module render function not found for ${moduleId}`);
            }
        } catch (err) {
            console.error(`Failed to load module ${moduleId}:`, err);
            container.innerHTML = `
                <div class="space-y-4">
                    <h3 class="text-lg font-bold text-[#D8C3A5] uppercase tracking-wider">${moduleId.toUpperCase()}</h3>
                    <p class="text-xs text-gray-300">Master schema data binding and module interface.</p>
                    <div class="p-4 bg-[#2C353D] rounded border border-[#6A7B8C] text-xs text-gray-200 space-y-2 font
