import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { Card, PrimaryButton } from '../components/common/UIComponents';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ProjectRestaurantsModal } from '../components/projects/ProjectRestaurantsModal';
import { PinConfirmModal } from '../components/common/PinConfirmModal';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const ProjectsScreen = () => {
  const { projects, saveProject, deleteProject, projectRestaurants, saveProjectRestaurant, deleteProjectRestaurant } = useApp();
  const [editingProject, setEditingProject] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeRestProject, setActiveRestProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const activeProjects = projects.filter(p => p.status === 'active');
  const totalRevenue = activeProjects.reduce((acc, p) => acc + (Number(p.monthlyIncome) || 0), 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <PrimaryButton title="Nuevo Proyecto" icon="add-circle" onPress={() => setIsAddModalOpen(true)} small />
      </View>

      <Card style={styles.kpiCard}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiTextBox}>
            <Text style={styles.kpiLabel}>Recaudación Mensual Proyectos</Text>
            <Text style={styles.kpiValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={styles.kpiCountBadge}>
            <Text style={styles.kpiCountText}>{activeProjects.length} Activos</Text>
          </View>
        </View>
      </Card>

      <Card title="Proyectos de la Empresa & Clientes" icon="briefcase-outline">
        {projects.map((proj) => (
          <ProjectCard
            key={proj.id}
            project={proj}
            onEdit={setEditingProject}
            onDelete={(id) => setDeletingProjectId(id)}
            onOpenRestaurants={(p) => setActiveRestProject(p)}
            restaurantsCount={(projectRestaurants[proj.id] || []).length}
          />
        ))}
      </Card>

      <ProjectModal
        visible={Boolean(editingProject || isAddModalOpen)}
        project={editingProject}
        onClose={() => { setEditingProject(null); setIsAddModalOpen(false); }}
        onSave={saveProject}
      />

      {activeRestProject && (
        <ProjectRestaurantsModal
          visible={Boolean(activeRestProject)}
          project={activeRestProject}
          restaurants={projectRestaurants[activeRestProject.id] || []}
          onClose={() => setActiveRestProject(null)}
          onSaveRestaurant={(rest) => saveProjectRestaurant(activeRestProject.id, rest)}
          onDeleteRestaurant={(restId) => deleteProjectRestaurant(activeRestProject.id, restId)}
        />
      )}

      <PinConfirmModal
        visible={Boolean(deletingProjectId)}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={() => { if (deletingProjectId) deleteProject(deletingProjectId); }}
        title="Eliminar Proyecto"
        description="Este proyecto y sus configuraciones asociadas serán eliminados."
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, gap: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  kpiTextBox: { flex: 1, minWidth: 160 },
  kpiLabel: { color: THEME.colors.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  kpiValue: { color: THEME.colors.success, fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  kpiCountBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999, borderWidth: 1, borderColor: '#bbf7d0', alignSelf: 'center' },
  kpiCountText: { color: '#15803d', fontSize: 11.5, fontWeight: '800' },
});
