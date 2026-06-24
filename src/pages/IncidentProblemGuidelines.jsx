// src/pages/IncidentProblemGuidelines.jsx

import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Briefcase,
  Server,
  UserCheck,
  Mail,
  BarChart3,
  BookOpen,
  Lightbulb,
  Target,
  Globe,
  Database,
  Lock,
  Eye,
  ChevronDown,
  ChevronUp,
  Printer,
  Download
} from 'lucide-react';

const IncidentProblemGuidelines = () => {
  const [expandedSections, setExpandedSections] = useState({
    rootCause: false,
    impact: false,
    corrective: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ICT Security Guidelines - Incident & Problem Management</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 30px; }
            h3 { color: #2563eb; margin-top: 20px; }
            .section { margin-bottom: 30px; }
            .box { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
            ul { margin: 10px 0; }
            li { margin: 5px 0; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div id="print-content">${document.getElementById('guidelines-content').innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-300" />
                Incident & Problem Management
              </h1>
              <p className="text-blue-200 mt-2 text-sm">
                Bangladesh Bank ICT Security Guidelines 2023 (Sections 4.3 & 4.4)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="guidelines-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Incident Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">4.3 Incident Management</h2>
          </div>
          
          <p className="text-gray-700 mb-6 pl-2 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
            An incident occurs when there is an unexpected disruption to the standard delivery of ICT services.
            The Organization shall appropriately manage such incidents to avoid a situation of mishandling
            that results in a prolonged disruption of ICT services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4.3.1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.1 Incident Management Framework</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Establish an incident management framework with the objective of restoring normal ICT service
                    as quickly as possible following an incident with minimal impact to business operations.
                    Establish roles and responsibilities for recording, analyzing, remediating, and monitoring incidents.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.2 Severity Levels</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Assign appropriate severity levels to incidents. Delegate severity determination to technical
                    helpdesk with proper training. Establish and document criteria for assessing severity levels.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.3 Escalation & Resolution</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Establish corresponding escalation and resolution procedures where the resolution timeframe
                    is proportionate with the severity level of the incident.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.4 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.4 Testing Response Plan</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    The predetermined escalation and response plan for security incidents shall be tested on a periodic basis.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.5 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-teal-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.5 ICT Emergency Response Team</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Form an ICT Emergency Response Team with necessary technical and operational skills to handle major incidents.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.6 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-red-600">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.6 Crisis Management</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Keep senior management apprised of major incidents that may develop into a crisis.
                    Inform Bangladesh Bank as soon as possible when a critical system fails over to its disaster recovery system.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.7 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-indigo-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.7 Customer Communication</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Keep customers informed of any major incident. Maintain customer confidence throughout a crisis
                    or emergency situation to protect reputation and soundness.
                  </p>
                </div>
              </div>
            </div>

            {/* 4.3.8 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">4.3.8 Incident Resolution</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Adequately address all incidents within corresponding resolution timeframes and monitor all incidents to their resolution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">4.4 Problem Management</h2>
          </div>

          <p className="text-gray-700 mb-6 pl-2 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            While the objective of incident management is to restore the ICT service as soon as possible,
            the aim of problem management is to determine and eliminate the root cause to prevent the occurrence of repeated incidents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 4.4.1 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">4.4.1 Problem Logging Process</h3>
              </div>
              <p className="text-gray-600 text-sm">Establish a process to log information system related problems.</p>
            </div>

            {/* 4.4.2 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">4.4.2 Workflow Escalation</h3>
              </div>
              <p className="text-gray-600 text-sm">Process to escalate any problem to concerned person for quick, effective, and orderly response.</p>
            </div>

            {/* 4.4.3 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">4.4.3 Documentation</h3>
              </div>
              <p className="text-gray-600 text-sm">Problem findings and action steps taken during the problem resolution process shall be documented.</p>
            </div>

            {/* 4.4.4 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">4.4.4 Root Cause & Impact Analysis</h3>
              </div>
              <p className="text-gray-600 text-sm">Perform root cause and impact analysis for major incidents with severe disruption. Take remediation actions to prevent recurrence.</p>
            </div>

            {/* 4.4.6 */}
            <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-800">4.4.6 Trend Analysis</h3>
              </div>
              <p className="text-gray-600 text-sm">Perform trend analysis of past problems to facilitate identification and prevention of similar problems.</p>
            </div>
          </div>

          {/* 4.4.5 Detailed Analysis Report Sections */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                4.4.5 Root-Cause & Impact Analysis Report
              </h3>
            </div>

            {/* Root Cause Analysis */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('rootCause')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-semibold text-gray-800">a) Root Cause Analysis</span>
                </div>
                {expandedSections.rootCause ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {expandedSections.rootCause && (
                <div className="px-6 pb-6 pt-2 bg-gray-50">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>When did it happen?</strong> - Timeline and duration of the incident</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>Where did it happen?</strong> - Location and scope of the incident</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>Why and how did the incident happen?</strong> - Causal factors and sequence of events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>How often had a similar incident occurred over last 2 years?</strong> - Frequency analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>Did detection occur promptly?</strong> - Detection effectiveness assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span><strong>What lessons were learnt from this incident?</strong> - Key takeaways and improvements</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Impact Analysis */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('impact')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">b) Impact Analysis</span>
                </div>
                {expandedSections.impact ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {expandedSections.impact && (
                <div className="px-6 pb-6 pt-2 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Extent of the Incident</h4>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• Systems, resources, and customers affected</li>
                        <li>• Geographic scope and operational impact</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Magnitude of the Incident</h4>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• Foregone revenue and financial losses</li>
                        <li>• Costs incurred and investments impacted</li>
                        <li>• Number of customers affected</li>
                        <li>• Reputational implications and consequences</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Regulatory Impact</h4>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• Breach of regulatory requirements and conditions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Corrective and Preventive Measures */}
            <div>
              <button
                onClick={() => toggleSection('corrective')}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">c) Corrective and Preventive Measures</span>
                </div>
                {expandedSections.corrective ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>
              {expandedSections.corrective && (
                <div className="px-6 pb-6 pt-2 bg-gray-50">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Immediate Corrective Action</h4>
                      <p className="text-gray-700">Address consequences of the incident with priority placed on addressing customers' concerns.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Root Cause Measures</h4>
                      <p className="text-gray-700">Measures to address the root cause of the incident.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Preventive Measures</h4>
                      <p className="text-gray-700">Measures to prevent similar or related incidents from occurring in the future.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary / Key Takeaways */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-800">Key Takeaways</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Establish incident management framework with clear roles and responsibilities</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Assign severity levels with proportionate resolution timeframes</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Form ICT Emergency Response Team for major incidents</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Perform root cause analysis for major incidents</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Document all problem findings and action steps</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">Conduct trend analysis for proactive problem prevention</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          <p>Source: Bangladesh Bank - Guideline on ICT Security Draft 2023 (Sections 4.3 & 4.4)</p>
          <p className="mt-1">For internal use only - Compliance Reference Document</p>
        </div>
      </div>
    </div>
  );
};

export default IncidentProblemGuidelines;