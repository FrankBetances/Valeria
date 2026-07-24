//
//  AcademyView.swift
//  Valeria
//
//  Valeria Academy · HUB MULTIDOMINIO (V2.0) · port de
//  src/ValeriaAcademy/{ValeriaAcademyScreen,AcademyDomainCard,AcademyPriorityFeed}.tsx.
//  Vistas internas (sin anidar navegación profunda, como en el original):
//    hub → lista de un dominio → lectura por diapositivas → micro-quiz.
//  Hipoacusia abre un sheet in-place (AcademyHardwareView). La XP se inyecta
//  siempre en el silo del dominio de origen de la cápsula (nunca se mezcla).
//

import SwiftUI

private struct CapsuleAccent { let bg: Color; let fg: Color; let label: String }

private func accentFor(_ c: AcademyCapsule) -> CapsuleAccent {
    let dm = DOMAIN_META[c.domain]!
    let label = c.domain == .lenguaje ? TRACK_ACCENT[c.track]!.label : dm.label.uppercased()
    return CapsuleAccent(bg: dm.accentBg, fg: dm.accentFg, label: label)
}

struct AcademyView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var router: Router

    private enum Stage {
        case hub
        case list(AcademyDomain)
        case read(AcademyCapsule)
        case quiz(AcademyCapsule)
    }

    @State private var stage: Stage = .hub
    @State private var hipoOpen = false

    var body: some View {
        Group {
            switch stage {
            case .hub: hubView
            case .list(let domain): listView(domain)
            case .read(let capsule):
                CapsuleReaderView(capsule: capsule, accent: accentFor(capsule),
                                   onExit: { stage = .list(capsule.domain) },
                                   onFinish: { stage = .quiz(capsule) })
            case .quiz(let capsule):
                CapsuleQuizView(capsule: capsule, accent: accentFor(capsule),
                                 onExit: { stage = .list(capsule.domain) },
                                 onDone: { stage = .list(capsule.domain) })
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
        .sheet(isPresented: $hipoOpen) { AcademyHardwareView() }
    }

    // MARK: - HUB

    private var hubView: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill { router.pop() }.padding(.bottom, 10)
                Text("valeria+ · academy").font(.system(size: 11.5, weight: .heavy)).tracking(1)
                    .foregroundStyle(Color.white.opacity(0.9)).padding(.bottom, 6)
                Text("🎓 Academy").font(.system(size: 23, weight: .heavy)).foregroundStyle(.white)
                Text("Tu hub de formación por dominios para acompañar la terapia como un profesional.")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9))
                    .padding(.top, 4)

                let s = model.academyAggregateSummary()
                let pct = Int((s.progress * 100).rounded())
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.white.opacity(0.28)).frame(height: 8)
                        Capsule().fill(Color.white).frame(width: geo.size.width * s.progress, height: 8)
                    }
                }.frame(height: 8).padding(.top, 14)
                Text("\(s.completedCount)/\(s.totalCount) · \(pct)%")
                    .font(.system(size: 12, weight: .heavy)).foregroundStyle(.white).padding(.top, 6)

                HStack(spacing: 8) {
                    gameChip("✨ \(s.xp) XP")
                    gameChip("🎖️ \(s.badgeCount) insignias")
                }.padding(.top, 4)

                AcademyPriorityFeedView { capsule in stage = .read(capsule) }
                    .padding(.top, 14)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 11) {
                    Text("DOMINIOS DE CAPACITACIÓN")
                        .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    ForEach(ACADEMY_DOMAINS, id: \.self) { domain in
                        AcademyDomainCardView(domain: domain) {
                            if domain == .hipoacusia { hipoOpen = true } else { stage = .list(domain) }
                        }
                    }
                }
                .padding(18)
            }
        }
    }

    private func gameChip(_ t: String) -> some View {
        Text(t).font(.system(size: 12, weight: .heavy)).foregroundStyle(.white)
            .padding(.horizontal, 11).padding(.vertical, 6)
            .background(Color.white.opacity(0.18))
            .overlay(RoundedRectangle(cornerRadius: 11).stroke(Color.white.opacity(0.32), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 11))
    }

    // MARK: - LISTA

    private func listView(_ domain: AcademyDomain) -> some View {
        let meta = DOMAIN_META[domain]!
        let capsules = ACADEMY_CAPSULES.filter { $0.domain == domain }
        return VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                BackPill(label: "‹ Dominios") { stage = .hub }.padding(.bottom, 10)
                Text("ACADEMY · \(meta.label.uppercased())")
                    .font(.system(size: 11.5, weight: .heavy)).tracking(1)
                    .foregroundStyle(Color.white.opacity(0.9)).padding(.bottom, 6)
                Text("\(meta.icon) \(meta.label)").font(.system(size: 23, weight: .heavy)).foregroundStyle(.white)
                Text(meta.blurb).font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 22).padding(.top, 18).padding(.bottom, 16)
            .background(meta.accentFg)
            .clipShape(BottomRoundedRectangle(radius: 26))

            ScrollView(showsIndicators: false) {
                VStack(spacing: 11) {
                    Text("CÁPSULAS DE CONOCIMIENTO")
                        .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    if capsules.isEmpty {
                        Text("Contenido de este dominio en preparación. Muy pronto tendrás cápsulas aquí.")
                            .font(.system(size: 13.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                            .multilineTextAlignment(.center)
                            .padding(18).frame(maxWidth: .infinity)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(VColor.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }

                    ForEach(capsules) { c in
                        let done = model.academyCompleted[c.id] != nil
                        let accent = accentFor(c)
                        Button { stage = .read(c) } label: {
                            HStack(spacing: 13) {
                                Text(c.icon).font(.system(size: 22))
                                    .frame(width: 46, height: 46).background(accent.bg).clipShape(RoundedRectangle(cornerRadius: 14))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(accent.label).font(.system(size: 9.5, weight: .heavy)).tracking(0.5).foregroundStyle(accent.fg)
                                    Text(c.title).font(.system(size: 15.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                    Text(c.summary).font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                                        .fixedSize(horizontal: false, vertical: true)
                                    Text("⏱️ \(c.minutes) min · ✨ \(c.xp) XP")
                                        .font(.system(size: 11, weight: .bold)).foregroundStyle(VColor.textMuted).padding(.top, 4)
                                }
                                Spacer(minLength: 0)
                                Text(done ? "✓" : "›").font(.system(size: 15, weight: .heavy))
                                    .foregroundStyle(done ? .white : accent.fg)
                                    .frame(width: 30, height: 30)
                                    .background(done ? VColor.success : accent.bg)
                                    .clipShape(Circle())
                            }
                            .padding(14).background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(done ? VColor.borderActive : VColor.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 16)).vCardShadow()
                        }.buttonStyle(.plain)
                    }
                }
                .padding(18)
            }
        }
    }
}

// MARK: - Tarjeta de Dominio

private struct AcademyDomainCardView: View {
    @EnvironmentObject private var model: AppModel
    let domain: AcademyDomain
    let onPress: () -> Void

    var body: some View {
        let meta = DOMAIN_META[domain]!
        let summary = model.academyDomainSummary(domain)
        let pct = Int((summary.progress * 100).rounded())
        let complete = summary.totalCount > 0 && summary.completedCount >= summary.totalCount

        Button(action: onPress) {
            HStack(spacing: 13) {
                Text(meta.icon).font(.system(size: 24))
                    .frame(width: 48, height: 48).background(meta.accentBg).clipShape(RoundedRectangle(cornerRadius: 15))
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 8) {
                        Text(meta.label).font(.system(size: 15.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                        if complete { Text("✓").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.success) }
                    }
                    Text(meta.blurb).font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                        .lineLimit(2)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color(hex: "eef0f2")).frame(height: 7)
                            Capsule().fill(meta.accentFg).frame(width: geo.size.width * summary.progress, height: 7)
                        }
                    }.frame(height: 7).padding(.top, 9)
                    HStack {
                        Text(summary.totalCount > 0 ? "\(summary.completedCount)/\(summary.totalCount) · \(pct)%" : "Próximamente")
                            .font(.system(size: 11.5, weight: .heavy)).foregroundStyle(meta.accentFg)
                        Spacer()
                        Text("🏅 \(summary.levelName)").font(.system(size: 11, weight: .bold)).foregroundStyle(VColor.textMuted)
                        Text("✨ \(summary.xp)").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.star)
                    }.padding(.top, 7)
                }
                Spacer(minLength: 0)
                Text("›").font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                    .frame(width: 30, height: 30).background(meta.accentFg).clipShape(Circle())
            }
            .padding(14).background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16)).vCardShadow()
        }.buttonStyle(.plain)
    }
}

// MARK: - Feed de Prioridad

private let PRIORITY_BY_DOMAIN: [AcademyDomain: [String]] = [
    .lenguaje: ["dev-input", "med-adulto"],
    .hipoacusia: ["dev-input", "med-adulto"],
    .dislalias: ["dis-punto", "dev-input"],
    .dislexia: ["dlx-fonologica", "dev-input"],
    .tea: ["tea-anticipar", "med-adulto"],
]

private struct AcademyPriorityFeedView: View {
    @EnvironmentObject private var model: AppModel
    let onOpenCapsule: (AcademyCapsule) -> Void

    var body: some View {
        let activeDomain = domainFromPatologia(model.activePatient?.patologia)
        let suggestions = (PRIORITY_BY_DOMAIN[activeDomain] ?? [])
            .compactMap { id in ACADEMY_CAPSULES.first(where: { $0.id == id }) }
            .filter { model.academyCompleted[$0.id] == nil }
            .prefix(2)

        if !suggestions.isEmpty {
            let meta = DOMAIN_META[activeDomain]!
            VStack(spacing: 0) {
                HStack {
                    Text("⭐ TU PRIORIDAD DE HOY").font(.system(size: 11, weight: .heavy)).tracking(0.8).foregroundStyle(.white)
                    Spacer()
                    Text("\(meta.icon) \(meta.short)").font(.system(size: 10.5, weight: .heavy)).foregroundStyle(.white)
                        .padding(.horizontal, 8).padding(.vertical, 3).background(Color.white.opacity(0.18)).clipShape(RoundedRectangle(cornerRadius: 9))
                }.padding(.bottom, 10)

                ForEach(Array(suggestions)) { c in
                    let cm = DOMAIN_META[c.domain]!
                    Button { onOpenCapsule(c) } label: {
                        HStack(spacing: 11) {
                            Text(c.icon).font(.system(size: 20))
                                .frame(width: 40, height: 40).background(cm.accentBg).clipShape(RoundedRectangle(cornerRadius: 12))
                            VStack(alignment: .leading, spacing: 1) {
                                Text(c.title).font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary).lineLimit(1)
                                Text(c.summary).font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted).lineLimit(1)
                            }
                            Spacer(minLength: 0)
                            Text(cm.short).font(.system(size: 10, weight: .heavy))
                                .foregroundStyle(cm.accentFg)
                                .padding(.horizontal, 8).padding(.vertical, 4)
                                .overlay(RoundedRectangle(cornerRadius: 9).stroke(cm.accentFg, lineWidth: 1.5))
                        }
                        .padding(10).background(Color.white).clipShape(RoundedRectangle(cornerRadius: 13))
                    }.buttonStyle(.plain).padding(.bottom, 8)
                }
            }
            .padding(12)
            .background(Color.white.opacity(0.14))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.white.opacity(0.28), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

// MARK: - Lectura por diapositivas

private struct CapsuleReaderView: View {
    let capsule: AcademyCapsule
    let accent: CapsuleAccent
    let onExit: () -> Void
    let onFinish: () -> Void

    @State private var i = 0

    var body: some View {
        let slide = capsule.slides[min(i, capsule.slides.count - 1)]
        let last = i + 1 >= capsule.slides.count

        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                BackPill(label: "‹ Cápsulas", action: onExit).padding(.bottom, 10)
                Text(accent.label).font(.system(size: 11.5, weight: .heavy)).tracking(1)
                    .foregroundStyle(Color.white.opacity(0.9)).padding(.bottom, 6)
                Text("\(capsule.icon) \(capsule.title)").font(.system(size: 21, weight: .heavy)).foregroundStyle(.white)
                HStack(spacing: 6) {
                    ForEach(capsule.slides.indices, id: \.self) { k in
                        Capsule().fill(k <= i ? Color.white : Color.white.opacity(0.4)).frame(width: 22, height: 5)
                    }
                }.padding(.top, 12)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 22).padding(.top, 18).padding(.bottom, 16)
            .background(accent.fg)
            .clipShape(BottomRoundedRectangle(radius: 26))

            ScrollView(showsIndicators: false) {
                VStack(spacing: 6) {
                    if let icon = slide.icon {
                        Text(icon).font(.system(size: 46)).multilineTextAlignment(.center).padding(.bottom, 4)
                    }
                    Text(slide.heading).font(.system(size: 19, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                        .multilineTextAlignment(.center)
                    Text(slide.body).font(.system(size: 14.5, weight: .semibold)).foregroundStyle(VColor.textSecondary)
                        .multilineTextAlignment(.center).lineSpacing(4).padding(.top, 8)
                }
                .padding(20).frame(maxWidth: .infinity)
                .background(Color.white)
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()
                .padding(18)
            }

            HStack(spacing: 10) {
                if i > 0 {
                    Button { i -= 1 } label: {
                        Text("‹ Atrás").font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                            .padding(.vertical, 15).padding(.horizontal, 18)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(VColor.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }.buttonStyle(.plain)
                }
                Button { last ? onFinish() : (i += 1) } label: {
                    Text(last ? "Hacer el quiz →" : "Siguiente ›")
                        .font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 15)
                        .background(accent.fg).clipShape(RoundedRectangle(cornerRadius: 14))
                }.buttonStyle(.plain)
            }
            .padding(16).padding(.bottom, 8)
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }
}

// MARK: - Micro-quiz de validación ágil

private struct CapsuleQuizView: View {
    @EnvironmentObject private var model: AppModel
    let capsule: AcademyCapsule
    let accent: CapsuleAccent
    let onExit: () -> Void
    let onDone: () -> Void

    @State private var qi = 0
    @State private var picked: Int? = nil
    @State private var correct = 0
    @State private var finished = false
    @State private var reward: AcademyCompletion? = nil
    @State private var passed = false
    @State private var score = 0

    var body: some View {
        if finished, let reward {
            resultView(reward)
        } else {
            questionView
        }
    }

    private var questionView: some View {
        let q = capsule.quiz[qi]
        let lastQ = qi + 1 >= capsule.quiz.count

        return VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                BackPill(label: "‹ Salir", action: onExit).padding(.bottom, 10)
                Text("QUIZ RÁPIDO · \(qi + 1)/\(capsule.quiz.count)")
                    .font(.system(size: 11.5, weight: .heavy)).tracking(1)
                    .foregroundStyle(Color.white.opacity(0.9)).padding(.bottom, 6)
                Text("\(capsule.icon) \(capsule.title)").font(.system(size: 21, weight: .heavy)).foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 22).padding(.top, 18).padding(.bottom, 16)
            .background(accent.fg)
            .clipShape(BottomRoundedRectangle(radius: 26))

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(q.prompt).font(.system(size: 17, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                        .lineSpacing(3).padding(.bottom, 6)

                    ForEach(q.options.indices, id: \.self) { idx in
                        let isAnswer = idx == q.answer
                        let isPicked = idx == picked
                        let show = picked != nil
                        Button { if picked == nil { picked = idx; if idx == q.answer { correct += 1 } } } label: {
                            HStack {
                                Text(q.options[idx]).font(.system(size: 14.5, weight: .bold))
                                    .foregroundStyle(show && isAnswer ? VColor.success : (show && isPicked ? VColor.error : VColor.textPrimary))
                                Spacer(minLength: 8)
                                if show && isAnswer { Text("✓").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.success) }
                                if show && isPicked && !isAnswer { Text("✕").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.error) }
                            }
                            .padding(15).background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(
                                show && isAnswer ? VColor.success : (show && isPicked && !isAnswer ? VColor.error : VColor.border),
                                lineWidth: 1.5))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }.buttonStyle(.plain).disabled(show)
                    }

                    if picked != nil {
                        Text("💡 \(q.rationale)").font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textSecondary)
                            .padding(13).background(VColor.primaryTint)
                            .overlay(RoundedRectangle(cornerRadius: 13).stroke(VColor.borderActive, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 13))
                    }
                }
                .padding(18)
            }

            Button {
                if lastQ {
                    let ratio = capsule.quiz.isEmpty ? 1 : Double(correct) / Double(capsule.quiz.count)
                    let didPass = ratio >= ACADEMY_PASS_THRESHOLD
                    reward = didPass ? model.completeAcademyUnit(capsule.id, quizScore: ratio)
                                      : AcademyCompletion(domain: capsule.domain, xpGained: 0, alreadyDone: false, newBadges: [], levelUp: false)
                    passed = didPass
                    score = Int((ratio * 100).rounded())
                    finished = true
                } else {
                    qi += 1; picked = nil
                }
            } label: {
                Text(lastQ ? "Ver resultado" : "Siguiente pregunta ›")
                    .font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 15)
                    .background(picked == nil ? accent.fg.opacity(0.4) : accent.fg)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }.buttonStyle(.plain).disabled(picked == nil)
                .padding(16).padding(.bottom, 8)
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    private func resultView(_ reward: AcademyCompletion) -> some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 4) {
                Text(passed ? "🎉 ¡Cápsula superada!" : "💪 Casi lo tienes")
                    .font(.system(size: 21, weight: .heavy)).foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 22).padding(.top, 18).padding(.bottom, 16)
            .background(accent.fg)
            .clipShape(BottomRoundedRectangle(radius: 26))

            ScrollView(showsIndicators: false) {
                VStack(spacing: 10) {
                    Text("\(score)%").font(.system(size: 48, weight: .heavy)).foregroundStyle(accent.fg)
                    Text(passed
                         ? "Has completado \"\(capsule.title)\"."
                         : "Necesitas al menos \(Int((ACADEMY_PASS_THRESHOLD * 100).rounded()))% para superarla. ¡Repasa y vuelve a intentarlo!")
                        .font(.system(size: 14, weight: .semibold)).foregroundStyle(VColor.textSecondary)
                        .multilineTextAlignment(.center)
                    if reward.xpGained > 0 {
                        Text("+\(reward.xpGained) XP").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.star).padding(.top, 6)
                    }
                    ForEach(reward.newBadges) { b in
                        HStack(spacing: 12) {
                            Text(b.icon).font(.system(size: 22))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(b.name).font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Text(b.desc).font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                            }
                            Spacer(minLength: 0)
                        }
                        .padding(13).background(VColor.pageBg).clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                }
                .padding(24).frame(maxWidth: .infinity)
                .background(Color.white)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(VColor.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 20)).vCardShadow()
                .padding(18)
            }

            HStack(spacing: 10) {
                if !passed {
                    Button { qi = 0; picked = nil; correct = 0; finished = false; self.reward = nil } label: {
                        Text("Reintentar").font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                            .padding(.vertical, 15).padding(.horizontal, 18)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(VColor.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }.buttonStyle(.plain)
                }
                Button(action: onDone) {
                    Text(passed ? "Volver a las cápsulas" : "Salir")
                        .font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 15)
                        .background(accent.fg).clipShape(RoundedRectangle(cornerRadius: 14))
                }.buttonStyle(.plain)
            }
            .padding(16).padding(.bottom, 8)
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }
}
