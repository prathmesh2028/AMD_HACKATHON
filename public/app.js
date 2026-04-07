document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentInputType = 'food_analysis';

    // DOM Elements
    const typeTabs = document.querySelectorAll('.type-tab');
    const analyzeBtn = document.getElementById('analyze-btn');
    const userInputField = document.getElementById('user-input');
    
    const outputPlaceholder = document.getElementById('output-placeholder');
    const loadingSpinner = document.getElementById('loading-spinner');
    const responseContainer = document.getElementById('response-container');
    const imageUploadWrapper = document.getElementById('image-upload-wrapper');
    const imageUploadInput = document.getElementById('image-upload');

    // Tab Switching Logic
    typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            typeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentInputType = tab.getAttribute('data-type');
            
            const placeholders = {
                'food_analysis': 'e.g. "I am craving a samosa with my evening chai..."',
                'image_analysis': 'Upload a food image below',
                'chat': 'e.g. "I feel too tired to workout after office today..."',
                'habit_analysis': 'e.g. "Analyze my eating patterns from the past week..."',
                'recommendation': 'e.g. "What should I eat right now?"'
            };
            userInputField.placeholder = placeholders[currentInputType] || 'Enter your query...';

            if (currentInputType === 'image_analysis') {
                userInputField.classList.add('hidden');
                imageUploadWrapper.classList.remove('hidden');
            } else {
                userInputField.classList.remove('hidden');
                imageUploadWrapper.classList.add('hidden');
            }
        });
    });

    // Helper function to read file as base64
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Analyze Button Logic
    analyzeBtn.addEventListener('click', async () => {
        const userInput = userInputField.value.trim();
        const imageFile = imageUploadInput.files[0];
        
        if (currentInputType !== 'recommendation' && currentInputType !== 'habit_analysis') {
            if (currentInputType === 'image_analysis' && !imageFile) return;
            if (currentInputType !== 'image_analysis' && !userInput) return;
        }

        // UI State: Loading
        outputPlaceholder.classList.add('hidden');
        responseContainer.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            // Determine endpoint route
            let route = '/api/analyze';
            if (currentInputType === 'recommendation') route = '/api/recommendation';
            if (currentInputType === 'chat') route = '/api/chat';
            if (currentInputType === 'habit_analysis') route = '/api/habit';

            // We pass a mock userId for now
            const payload = {
                userId: 'user123',
                input: currentInputType === 'image_analysis' ? 'Analyze this food.' : userInput,
            };

            if (currentInputType === 'image_analysis' && imageFile) {
                const base64Full = await fileToBase64(imageFile);
                // The split removes "data:image/png;base64,"
                payload.imageBase64 = base64Full.split(',')[1];
                payload.imageMimeType = imageFile.type;
            }

            const response = await fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const htmlResponse = renderDynamicHTML(currentInputType, result.data);
            responseContainer.innerHTML = htmlResponse;

        } catch (error) {
            responseContainer.innerHTML = `<div style="color: var(--danger); padding: 16px;">Error connecting to Intelligence Engine: ${error.message}</div>`;
        } finally {
            loadingSpinner.classList.add('hidden');
            responseContainer.classList.remove('hidden');
        }
    });

    // Render logic mapping backend JSON schemas to HTML UI
    function renderDynamicHTML(type, data) {
        let html = '';

        if (!data) return '<p>No data received.</p>';

        if (type === 'food_analysis') {
            html = `
                <div class="response-section">
                    <h3 class="response-title"><i class="ph ph-magnifying-glass"></i> Food Breakdown</h3>
                    <div class="data-grid">
                        <div class="data-card">
                            <div class="data-card-label">Est. Calories</div>
                            <div class="data-card-value">${data.food_breakdown?.calories || 'N/A'}</div>
                        </div>
                        <div class="data-card">
                            <div class="data-card-label">Macros (P / C / F)</div>
                            <div class="data-card-value" style="font-size: 16px;">${data.food_breakdown?.macros || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="response-section">
                     <h3 class="response-title"><i class="ph ph-target"></i> Goal Impact</h3>
                     <p style="font-size: 14px; color: #d1d5db;">
                        <strong>Support Goal? </strong>
                        <span style="color:${data.goal_impact?.supports_goal ? 'var(--success)' : 'var(--danger)'}">
                            ${data.goal_impact?.supports_goal ? 'YES.' : 'NO.'}
                        </span> 
                        ${data.goal_impact?.reason || ''}
                    </p>
                </div>

                <div class="response-section">
                     <h3 class="response-title"><i class="ph ph-clock"></i> Context Fit</h3>
                     <p style="font-size: 14px; color: #d1d5db;">
                        <strong>Right for THIS time? </strong>
                        <span style="color:${data.context_fit?.right_time ? 'var(--success)' : 'var(--danger)'}">
                            ${data.context_fit?.right_time ? 'YES.' : 'NO.'}
                        </span> 
                        ${data.context_fit?.reason || ''}
                    </p>
                </div>

                <div class="verdict-box">
                    <h4><i class="ph ph-lightbulb"></i> Smart Advice</h4>
                    <p style="color:${data.smart_advice?.action === 'Eat' ? 'var(--success)' : 'var(--warning)'}; font-weight:bold;">${data.smart_advice?.action}</p>
                    <p style="margin-top: 8px;"><strong>Portion:</strong> ${data.smart_advice?.portion || 'N/A'}</p>
                    <p><strong>Better Alternative:</strong> ${data.smart_advice?.alternative || 'N/A'}</p>
                </div>
            `;
        } 
        else if (type === 'recommendation') {
            html = `
                <div class="response-section">
                    <h3 class="response-title"><i class="ph ph-compass"></i> Next Best Action</h3>
                     <p style="font-size: 14px; color: #d1d5db;">${data.next_best_action}</p>
                </div>

                <div class="response-section">
                     <h3 class="response-title"><i class="ph ph-brain"></i> Reasoning</h3>
                     <p style="font-size: 14px; color: #d1d5db;">${data.reasoning}</p>
                </div>

                <div class="response-section">
                    <h3 class="response-title"><i class="ph ph-bowl-food"></i> Meal Suggestion</h3>
                    <div class="data-grid">
                        <div class="data-card" style="grid-column: span 2;">
                            <div class="data-card-label">Food Item</div>
                            <div class="data-card-value" style="font-size: 18px;">${data.meal_suggestion?.food}</div>
                        </div>
                        <div class="data-card">
                            <div class="data-card-label">Calories</div>
                            <div class="data-card-value">${data.meal_suggestion?.calories}</div>
                        </div>
                    </div>
                </div>

                <div class="verdict-box">
                    <h4><i class="ph ph-lightning"></i> Quick Hack</h4>
                    <p style="margin-top: 8px;">${data.quick_hack}</p>
                </div>
            `;
        }
        else if (type === 'chat') {
            html = `
                <div class="response-section">
                    <div class="verdict-box" style="margin-top: 0; background: rgba(0,195,255,0.1); border-left-color: var(--accent-blue);">
                        <h4 style="color: var(--accent-blue);">Insight</h4>
                        <p>${data.insight}</p>
                    </div>

                    <div class="verdict-box" style="background: rgba(0,255,170,0.1); border-left-color: var(--accent-glow);">
                        <h4 style="color: var(--accent-glow);">Advice</h4>
                        <p>${data.advice}</p>
                    </div>

                    <div class="verdict-box" style="background: rgba(255,165,2,0.1); border-left-color: var(--warning);">
                        <h4 style="color: var(--warning);">Action Step</h4>
                        <p>${data.action_step}</p>
                    </div>

                    <p style="text-align: center; margin-top: 24px; font-style: italic; font-weight:bold; color: var(--text-primary);">"${data.motivation}"</p>
                </div>
            `;
        }
        else if (type === 'habit_analysis') {
            const badHabits = data.pattern_detection?.bad_habits?.map(h => `<li><span style="color:var(--danger)">Bad Habit:</span> ${h}</li>`).join('') || '';
            const goodHabits = data.pattern_detection?.good_habits?.map(h => `<li><span style="color:var(--success)">Good Habit:</span> ${h}</li>`).join('') || '';
            const fixes = data.fix_plan?.map(f => `<li>${f}</li>`).join('') || '';

            html = `
                <div class="response-section">
                    <h3 class="response-title"><i class="ph ph-chart-line-up"></i> Pattern Detection</h3>
                    <ul class="smart-list">
                        ${badHabits}
                        ${goodHabits}
                    </ul>
                </div>

                <div class="response-section">
                     <h3 class="response-title"><i class="ph ph-magnifying-glass"></i> Hidden Issues</h3>
                     <p style="font-size: 14px; color: #d1d5db;">${data.hidden_issues}</p>
                </div>
                
                <div class="verdict-box">
                    <h4><i class="ph ph-wrench"></i> Fix Plan</h4>
                    <ol style="margin-left: 20px; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                        ${fixes}
                    </ol>
                </div>

                <div class="verdict-box" style="margin-top: 12px; background: rgba(0,195,255,0.1); border-left-color: var(--accent-blue);">
                    <h4 style="color: var(--accent-blue);"><i class="ph ph-calendar"></i> Daily Routine structure</h4>
                     <p style="font-size: 14px; margin-top: 8px;">${data.daily_routine}</p>
                </div>
            `;
        }
        else {
            // image_analysis or fallback
            html = `<p>Received data successfully. ${JSON.stringify(data)}</p>`;
        }

        return html;
    }
});
