import MealForm from "../../components/MealForm";
import MealList from "../../components/MealList";
import Trends from "../../components/TrendsChart";

export default function DashboardPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Daily Meal Log</h1>
        <p className="text-sm text-gray-500">Add meals with macros to track your nutrition.</p>
        <div className="mt-4">
          <MealForm />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your Meals</h2>
        <MealList />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Trends (30 days)</h2>
        <Trends />
      </section>
    </main>
  );
}