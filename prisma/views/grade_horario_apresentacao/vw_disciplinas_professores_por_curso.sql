SELECT
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `d`.`modalidade` AS `modalidade`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `professor_aptos`,
  `p`.`titulacao` AS `titulacao`
FROM
  (
    (
      (
        (
          `grade_horario_apresentacao`.`curso_disciplina` `cd`
          JOIN `grade_horario_apresentacao`.`curso` `c` ON((`cd`.`idCurso` = `c`.`idCurso`))
        )
        JOIN `grade_horario_apresentacao`.`disciplina` `d` ON((`cd`.`idDisciplina` = `d`.`idDisciplina`))
      )
      JOIN `grade_horario_apresentacao`.`disciplina_professor` `dp` ON((`dp`.`idDisciplina` = `d`.`idDisciplina`))
    )
    JOIN `grade_horario_apresentacao`.`professor` `p` ON((`dp`.`idProfessor` = `p`.`idProfessor`))
  )
ORDER BY
  `c`.`nomeCurso`,
  `d`.`nomeDisciplina`