export function renderLegalDisclaimerModal(onAccept) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'legal-modal-overlay';
    modalOverlay.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    
    modalOverlay.innerHTML = `
        <div class="bg-[#161616] border border-[#C5A059] p-8 rounded-lg max-w-lg w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded bg-[#C5A059] flex items-center justify-center font-bold text-[#0E0E0E]">LLB</div>
                <h2 class="text-lg font-bold text-[#C5A059]">Legal & UPL Notice</h2>
            </div>
            <div class="text-xs text-gray-300 space-y-2 leading-relaxed bg-[#0E0E0E] p-4 rounded border border-gray-800 max-h-60 overflow-y-auto">
                <p><strong>Notice of Operational Scope:</strong> The LLB (Life, Legacy, and Bereavement) platform is a secure enterprise estate workflow and operational ERP system developed and operated by Griffin Property and Holdings LLC (Griffin Consulting).</p>
                <p><strong>Not Legal Representation:</strong> LLB is an administrative tracking tool and workflow organizer. It does not provide formal legal representation, draft binding testamentary instruments without licensed counsel review, or engage in the unauthorized practice of law (UPL).</p>
                <p>Users are strongly advised to retain licensed legal counsel (such as the primary attorney recorded in Module 1) to validate all estate, trust, and probate execution documents.</p>
            </div>
            <div class="flex items-center gap-2 pt-2">
                <input type="checkbox" id="accept-upl" class="rounded bg-[#0E0E0E] border-gray-700 text-[#C5A059] focus:ring-0" />
                <label for="accept-upl" class="text-xs text-gray-300 cursor-pointer">I acknowledge and accept these operational terms *</label>
            </div>
            <button id="btn-accept-upl" disabled class="w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed">Proceed to Master Dashboard</button>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const checkbox = modalOverlay.querySelector('#accept-upl');
    const acceptBtn = modalOverlay.querySelector('#btn-accept-upl');

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            acceptBtn.disabled = false;
            acceptBtn.className = 'w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition cursor-pointer';
        } else {
            acceptBtn.disabled = true;
            acceptBtn.className = 'w-full bg-gray-700 text-gray-400 font-bold py-2 rounded transition cursor-not-allowed';
        }
    });

    acceptBtn.addEventListener('click', () => {
        modalOverlay.remove();
        if (onAccept) onAccept();
    });
}
